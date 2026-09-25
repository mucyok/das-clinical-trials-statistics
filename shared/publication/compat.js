/* Safari (WebKit) misplaces positioned HTML inside SVG foreignObject whenever the drawing is scaled,
   moved or animated. On WebKit only: mark the page so compat.css can flatten simple formulas,
   avoid movement animations inside formulas, rewrite single subscripts or superscripts (x₁, Q₃)
   as a plain vertical offset, and lift the remaining stacked formulas out of the SVG. */
(() => {
 const ua = navigator.userAgent;
 if (!/AppleWebKit/.test(ua) || /Chrome\/|Chromium\/|Edg\//.test(ua)) return;
 document.documentElement.classList.add('webkit');

 // A transform animation inside a foreignObject leaves its formula misplaced and mis-scaled:
 // keep the fade, drop the slide-in movement.
 const animate = Element.prototype.animate;
 Element.prototype.animate = function (keyframes, options) {
  if (Array.isArray(keyframes) && this.closest?.('foreignObject') && keyframes.some(k => 'transform' in k)) keyframes = keyframes.map(({transform, ...rest}) => rest);
  return animate.call(this, keyframes, options);
 };

 // KaTeX places a lone script with position:relative (top T) above a strut of height P:
 // its baseline sits T + P below the main baseline, which vertical-align reproduces without positioning.
 const flatten = root => {
  for (const script of root.querySelectorAll('foreignObject .msupsub:not([data-flat])')) {
   script.dataset.flat = '';
   const column = script.querySelector(':scope > .vlist-t > .vlist-r > .vlist');
   const items = column ? [...column.children] : [];
   if (items.length !== 1) continue;
   const item = items[0], strut = item.querySelector(':scope > .pstrut'), content = item.lastElementChild;
   const top = parseFloat(item.style.top), height = parseFloat(strut?.style.height);
   if (!strut || content === strut || Number.isNaN(top) || Number.isNaN(height)) continue;
   const flat = document.createElement('span');
   flat.style.cssText = `display:inline-block;vertical-align:${-(top + height)}em;margin-left:${item.style.marginLeft || 0};margin-right:${item.style.marginRight || 0}`;
   flat.append(content);
   script.replaceChildren(flat);
  }
 };
 // Formulas that still stack (fractions, sums, accents) cannot be fixed in place. Lift their content
 // out of the SVG into plain HTML laid exactly over the foreignObject, and keep it there each frame.
 const lifted = new Map();
 const lift = stage => {
  const slide = stage.querySelector('.slide');
  if (!slide) return;
  for (const fo of slide.querySelectorAll('foreignObject')) {
   if (lifted.has(fo) || !fo.querySelector('.vlist')) continue;
   const box = document.createElement('div');
   box.className = 'lifted-formula';
   box.append(...fo.childNodes);
   slide.append(box);
   lifted.set(fo, box);
  }
 };
 const opacity = fo => {
  let o = 1;
  for (let e = fo; e && !e.classList?.contains('slide'); e = e.parentElement) {
   const cs = getComputedStyle(e);
   if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
   o *= +cs.opacity;
  }
  return o;
 };
 const place = () => {
  for (const [fo, box] of lifted) {
   if (!fo.isConnected) { lifted.delete(fo); box.remove(); continue; }
   const slide = box.parentElement, s = slide.getBoundingClientRect(), k = s.width / slide.offsetWidth;
   const r = fo.getBoundingClientRect(), w = fo.width.baseVal.value, h = fo.height.baseVal.value;
   const css = `left:${(r.left - s.left) / k}px;top:${(r.top - s.top) / k}px;width:${w}px;height:${h}px;transform:scale(${w ? r.width / k / w : 1});opacity:${opacity(fo)}`;
   if (box.dataset.css !== css) { box.dataset.css = css; box.style.cssText = css; }
  }
  requestAnimationFrame(place);
 };
 document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('stage');
  if (!stage) return;
  const update = () => { flatten(stage); lift(stage); };
  update();
  new MutationObserver(update).observe(stage, {childList: true, subtree: true});
  requestAnimationFrame(place);
 });
})();

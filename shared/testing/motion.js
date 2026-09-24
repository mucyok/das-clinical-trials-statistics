const shapeSnapshot=root=>Object.fromEntries([...root.querySelectorAll('[data-morph]')].map(e=>[e.dataset.morph,{d:e.getAttribute('d'),x:e.getAttribute('x'),width:e.getAttribute('width')} ]));
function morphShapes(root,old,duration=800){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const numberPattern=/-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
 root.querySelectorAll('[data-morph]').forEach(e=>{const from=old[e.dataset.morph];if(!from)return;
  for(const attr of ['d','x','width']){const end=e.getAttribute(attr),start=from[attr];if(!end||!start||end===start)continue;
   const a=start.match(numberPattern)?.map(Number),b=end.match(numberPattern)?.map(Number);if(!a||a.length!==b.length)continue;
   const born=performance.now();const tick=now=>{if(!e.isConnected)return;const t=Math.min(1,(now-born)/duration),u=t*t*(3-2*t);let i=0;e.setAttribute(attr,end.replace(numberPattern,()=>String(a[i]+(b[i]-a[i++])*u)));if(t<1)requestAnimationFrame(tick);else e.setAttribute(attr,end);};requestAnimationFrame(tick);
  }
 });
}
function bindPowerControls(){
 const host=document.querySelector('[data-power-host]'),slider=host?.querySelector('[data-n-slider]');if(!slider)return;
 slider.addEventListener('input',()=>{const cfg=JSON.parse(host.dataset.config);cfg.n=+slider.value;host.dataset.config=JSON.stringify(cfg);
  const figure=host.querySelector('[data-power-figure]');figure.innerHTML=powerFigure(cfg);
  host.querySelector('[data-sample-size]').textContent=`${cfg.n} people per study`;host.querySelector('output').textContent=cfg.n;
 });
}

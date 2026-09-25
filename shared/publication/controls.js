/* Public navigation polish: a link back to the course page, icon buttons,
   a fixed-width slide counter (so the arrows never move under the pointer),
   and a close cross on the slide overview. */
(() => {
 const nav = document.querySelector('nav'), position = document.getElementById('position');
 const full = document.getElementById('fullButton'), overview = document.getElementById('overview'), overviewButton = document.getElementById('overviewButton');
 if (!nav || !position || new URLSearchParams(location.search).has('print')) return;
 const icon = paths => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
 const icons = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-6h4v6"/>',
  enter: '<path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/>',
  exit: '<path d="M9 4v5H4"/><path d="M15 4v5h5"/><path d="M9 20v-5H4"/><path d="M15 20v-5h5"/>',
 };

 const home = document.createElement('a');
 home.id = 'homeButton';
 home.href = '../index.html';
 home.title = 'Course page';
 home.setAttribute('aria-label', 'Back to the course page');
 home.innerHTML = icon(icons.home);
 nav.prepend(home);

 if (full) {
  full.classList.add('icon-button');
  const update = () => {
   const on = !!document.fullscreenElement;
   full.innerHTML = icon(on ? icons.exit : icons.enter);
   full.title = on ? 'Exit full screen' : 'Full screen';
   full.setAttribute('aria-label', full.title);
  };
  update();
  document.addEventListener('fullscreenchange', update);
 }

 // Slide number only: the step count changed the counter's width at every step.
 const slideOnly = () => { const t = position.textContent, short = t.split('·')[0].trim(); if (short !== t) position.textContent = short; };
 slideOnly();
 new MutationObserver(slideOnly).observe(position, {childList: true, characterData: true, subtree: true});

 if (overview && overviewButton) {
  const close = () => { if (!overview.hidden) overviewButton.click(); };
  const addCross = () => {
   if (overview.querySelector('.overview-close')) return;
   const cross = document.createElement('button');
   cross.className = 'overview-close';
   cross.title = 'Close';
   cross.setAttribute('aria-label', 'Close the slide list');
   cross.innerHTML = icon('<path d="M6 6l12 12"/><path d="M18 6 6 18"/>');
   cross.addEventListener('click', e => { e.stopPropagation(); close(); });
   overview.prepend(cross);
  };
  addCross();
  new MutationObserver(addCross).observe(overview, {childList: true});
  // A click outside the list only closes it, without acting on the slide underneath.
  document.addEventListener('click', e => {
   if (overview.hidden || overview.contains(e.target) || nav.contains(e.target)) return;
   e.stopPropagation();
   e.preventDefault();
   close();
  }, true);
 }
})();

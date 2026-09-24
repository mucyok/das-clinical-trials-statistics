/* Citations at the foot of slides that show published material, and a references slide before "Thank you".
   data-latex-source keeps latex-content.js from typesetting the digits of references as mathematics. */
(() => {
 const topic = location.pathname.includes('topic-07') ? 7 : location.pathname.includes('topic-08') ? 8 : location.pathname.includes('topic-09') ? 9 : 10;
 const link = (url, text = url.replace(/^https?:\/\//, '')) => `<a href="${url}">${text}</a>`;
 const doi = d => 'doi:' + link(`https://doi.org/${d}`, d);

 const cite = {
  jama: `Hayward G, et al. <i>JAMA</i> 2017;317(15):1535. ${doi('10.1001/jama.2017.3417')}`,
  kerr: `Kerr NL. <i>Personality and Social Psychology Review</i> 1998;2(3):196. ${doi('10.1207/s15327957pspr0203_4')}`,
 };
 const ref = {
  hayward: `Hayward G, Hay AD, Moore MV, et al. Effect of oral dexamethasone without immediate antibiotics vs placebo on acute sore throat in adults: a randomized clinical trial. <i>JAMA</i> 2017;317(15):1535. ${doi('10.1001/jama.2017.3417')}`,
  xkcd: `Munroe R. Significant. <i>xkcd</i> 882. ${link('https://xkcd.com/882/')}. Licensed CC BY-NC 2.5.`,
  kerr: `Kerr NL. HARKing: hypothesizing after the results are known. <i>Personality and Social Psychology Review</i> 1998;2(3):196. ${doi('10.1207/s15327957pspr0203_4')}`,
  osc: `Open Science Collaboration. Estimating the reproducibility of psychological science. <i>Science</i> 2015;349(6251):aac4716. ${doi('10.1126/science.aac4716')}`,
 };

 // Slide number (1-based) and expected title, so a reordered deck fails loudly instead of citing the wrong slide.
 const footers = {
  7: [[2, 'Statistics in a clinical trial', cite.jama], [3, 'Descriptive statistics', cite.jama], [11, 'Numerical summaries: Measures of dispersion', cite.jama], [12, 'Numerical summaries: Measures of dispersion', cite.jama], [17, 'Descriptive statistics: interpretation', cite.jama], [19, 'From description to inference', cite.jama]],
  8: [],
  9: [[2, 'Does the drug have an effect?', cite.jama]],
  10: [[2, 'Does the drug have an effect?', cite.jama], [10, 'What the JAMA study planned', cite.jama], [15, 'HARKing', cite.kerr]],
 }[topic];
 // Only works cited on the slides themselves.
 const references = {
  7: [ref.hayward],
  8: [ref.hayward],
  9: [ref.hayward],
  10: [ref.hayward, ref.xkcd, ref.kerr, ref.osc],
 }[topic];

 for (const [number, title, text] of footers) {
  const slide = slides[number - 1];
  if (!slide || slide.title !== title) throw new Error(`Citation target moved: slide ${number} is not "${title}"`);
  const render = slide.render;
  slide.render = (...args) => render(...args) + `<p class="slide-citation" data-latex-source>${text}</p>`;
 }

 const last = slides.at(-1);
 if (last.title !== 'Thank you') throw new Error('The last slide is expected to be "Thank you"');
 slides.splice(slides.length - 1, 0, {
  title: 'References', steps: 1, printSteps: [0], minutes: 0, className: 'references-slide',
  render: () => `<ol class="references" data-latex-source>${references.map(r => `<li>${r}</li>`).join('')}</ol>`,
 });
})();

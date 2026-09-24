 
const v6Before=slides.slice();
const v6Relabel=slides[12].render;
slides[12].render=k=>v6Relabel(k).replace(math(tex`\widehat p\ \overset{\mathrm{approx.}}{\sim}\ \mathcal N(p,\mathrm{SE}^2)`),math(tex`\widehat p\ \overset{\scriptscriptstyle\mathrm{approx.}}{\sim}\ \mathcal N(p,\mathrm{SE}^2)`));

const v6Unknown=slides[14].render;
slides[14].render=k=>v6Unknown(k).replace(math(tex`\widehat{\mathrm{SE}}=\sqrt{\frac{0.18\times0.82}{100}}\approx0.0384`,true),math(tex`\widehat{\mathrm{SE}}=\sqrt{\frac{0.18\times0.82}{100}}\approx0.0384=3.84\%`,true)).replace('<p class="medium center">3.84%</p>','');

const v6Interval=slides[15].render;
slides[15].title='A 95% confidence interval and its margin of error';
slides[15].steps=3;slides[15].printSteps=[0,1,2];slides[15].minutes=2;
slides[15].className+=' v6-interval';
slides[15].render=k=>k<2?v6Interval(k):`<p class="lead">One sample: 18 cases among 100 people.</p><div class="v4-equation">${math(tex`18\%\pm1.96\times3.84\%\quad\Rightarrow\quad[10.5\%,\ 25.5\%]`,true)}</div><div class="v6-margin-equation">${math(tex`E=z_{1-\alpha/2}\,\widehat{\mathrm{SE}}\approx7.53\%`,true)}</div>${marginPicture(2)}<p class="bottomline">The margin of error is the half-width of the interval.</p>`;
;

const v6Coverage=linkedCoverageScene;
linkedCoverageScene=config=>v6Coverage(config).replace(/<p class="v5-coverage-guarantee">[\s\S]*?<\/p>/,`<div class="v6-coverage-guarantee"><strong>≈ ${config.level}%</strong><div><p>of intervals contain the true value<br>across repeated samples.</p><span>For a well-calibrated ${config.level}% confidence procedure.</span></div></div>`);

const v6Planning=slides[19].render;
slides[19].render=k=>v6Planning(k).replace(math(k===0?tex`E=z_{1-\alpha/2}\sqrt{\frac{p_{\rm plan}(1-p_{\rm plan})}{n}}`:tex`n\ge\frac{z_{1-\alpha/2}^{\,2}\,p_{\rm plan}(1-p_{\rm plan})}{E^2}`,true),math(k===0?tex`E=z_{1-\alpha/2}\sqrt{\frac{p(1-p)}{n}}`:tex`n\ge\frac{z_{1-\alpha/2}^{\,2}\,p(1-p)}{E^2}`,true)).replace('planning prevalence 20%','assumed prevalence 20%');
;
const v6Mean=slides[18].render;
slides[18].className+=' v6-mean';
slides[18].render=k=>v6Mean(k).replace(/<div class="cols mean-summaries">[\s\S]*?<div class="rule"><\/div>/,`<div class="v6-mean-summaries"><div><p>Sample mean</p><div>${math(tex`\overline x=\frac1{100}\sum_{i=1}^{100}x_i=125\text{ mmHg}`,true)}</div></div><div><p>Sample standard deviation</p><div>${math(tex`\widehat\sigma=\sqrt{\frac1{100-1}\sum_{i=1}^{100}(x_i-\overline x)^2}=15\text{ mmHg}`,true)}</div></div></div><div class="rule"></div>`);
const v6Closing=slides[21].render;
slides[21].render=k=>v6Closing(k).replace('equals a particular value?','equals a given value?');


slides.splice(13,1);
Object.assign(window.DECK,{slides});

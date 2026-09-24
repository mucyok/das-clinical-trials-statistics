 


const v5Sampling=samplingPicture;
samplingPicture=(index=0,phase=0,historyCount=0)=>{
 const selected=sampleIllustration.selections[index],order=[...selected].sort((a,b)=>a-b),rank=new Map(order.map((p,i)=>[p,i]));
 let html=v5Sampling(index,phase,historyCount).replace('Same positions','Same individuals').replace('100 selected individuals translate together to form sample','100 selected individuals form a 10 by 10 sample').replace('Relative positions, colours and point sizes are preserved.','Spatial order determines the grid placement. Colours and point sizes are preserved.').replace('x="672" y="75" width="440" height="356"','x="794" y="149" width="185" height="185"');
 html=html.replace(/<g data-key="draw-\d+-person-\d+"[^>]+>/g,tag=>{
  const p=+tag.match(/data-population-index="(\d+)"/)[1],r=rank.get(p),x=810+r%10*17,y=165+Math.floor(r/10)*17;
  tag=tag.replace('data-rigid-sample',`data-grid-sample data-grid-rank="${r}"`);
  return phase>=2?tag.replace(/style="[^"]+"/,`style="transform:translate(${x}px,${y}px)"`):tag;
 });
 return html;
};
const v5Compact=compactSamplingContext;
compactSamplingContext=(total=3)=>{
 const order=[...compactSelection(Math.max(0,total-1))].sort((a,b)=>a-b),rank=new Map(order.map((p,i)=>[p,i]));
 return v5Compact(total).replace('The selected points keep the same relative positions as in the population.','The selected individuals form a 10 by 10 square.').replace(/<circle data-mini-person[^>]+>/g,tag=>{
  const r=rank.get(+tag.match(/data-population-index="(\d+)"/)[1]);
  return tag.replace(/cx="[^"]+"/,`cx="${485+r%10*7.5}"`).replace(/cy="[^"]+"/,`cy="${36+Math.floor(r/10)*7.5}"`).replace('r="1.65"','r="2.7"');
 });
};
for(const i of [4,6,7]);

slides[5].render=k=>`<p class="lead">An estimator is a rule for calculating a value from sample data.</p><p class="coding-line">Disease status: 1 = present, 0 = absent.</p><div class="${showIf(k>=1)}"><p class="medium teal">Estimator: the rule for any sample</p><div class="formula center">${math(tex`\widehat p=\frac{X_1+\cdots+X_n}{n}`,true)}</div><p class="medium center">Number of cases divided by sample size.</p></div><div class="rule"></div><div class="${showIf(k>=2)}"><p class="medium">Estimate: the value calculated from our observed sample</p><div class="formula center">${math(tex`\widehat p=\frac{18}{100}=18\%`,true)}</div><p class="estimate-result center teal">For this sample, the estimated prevalence is 18%.</p></div>`;
;
const v5Theorem=slides[9].render;
slides[9].render=k=>v5Theorem(k).replace('Four times as many people halves the standard error.','Quadrupling the sample size halves the standard error.').replace('Variance of','Exact variance of').replace('SE of','Exact SE of');
;
;

function v5Hero(formula,right=''){
 return `<div class="v5-distribution-head"><div class="v5-distribution-formula">${math(formula)}</div>${right}</div>`;
}
function v5Standard(k){
 const right=`<div class="v5-parameters"><div><span>Mean</span>${math(tex`0`)}</div><div><span>Variance</span>${math(tex`1`)}</div><div><span>SD</span>${math(tex`1`)}</div></div>`;
 const config=[{label:'100%'},{hi:0,label:'50%'},{lo:-1,hi:1,label:'≈ 68%',marks:[-1,1]},{lo:-2,hi:2,label:'≈ 95%',marks:[-2,2]}][k];
 const reading=['The total area represents 100% probability.','A 50% probability of a value below zero.','About 68% probability of a value between −1 and +1.','About 95% probability of a value between −2 and +2.'];
 return v5Hero(tex`Z\sim\mathcal N(0,1)`,right)+v4Bell(config)+`<div class="v5-probability-reading">${k?math([null,tex`\Pr(Z<0)=0.5`,tex`\Pr(-1<Z<1)\approx0.68`,tex`\Pr(-2<Z<2)\approx0.9545`][k],true):reading[k]}</div><p class="bottomline">${k===0?'Z is a random variable. Areas under its curve describe probabilities.':k===1?'The standard normal is symmetric. Its mean and median are both zero.':reading[k]}</p>`;
}
slides[10].render=v5Standard;
;
const v5Quantiles=slides[11].render;
slides[11].title='Standard Normal quantiles';
slides[11].render=k=>v5Quantiles(k).replace(/<p class="v4-reference">[\s\S]*?<\/p>/,v5Hero(tex`Z\sim\mathcal N(0,1)`,'<p class="v5-head-note">Quantiles from a table</p>'));
const v5Relabel=slides[12].render;
slides[12].render=k=>{
 const head=k===0?v5Hero(tex`Z\sim\mathcal N(0,1)`,'<p class="v5-head-note">The central 95%</p>'):`<div class="v5-coordinate-head"><div><p>Standard reference</p>${math(tex`Z\sim\mathcal N(0,1)`)}</div><span class="v5-coordinate-arrow">→</span><div><p>Sampling approximation</p>${math(tex`\widehat p\ \overset{\mathrm{approx.}}{\sim}\ \mathcal N(p,\mathrm{SE}^2)`)}</div></div>`;
 return v5Relabel(k).replace(/<p class="v4-reference">[\s\S]*?<\/p>/,head).replace('Same bell on screen, new numerical scale. The sampling approximation adds ≈.','Multiply by the standard error, then add the population prevalence.');
};

function v5Recentre(k){
 const X=x=>135+x/.4*890,E=Z95*SE,c=k? .18:P,y=113;
 let b=line(X(0),198,X(.4),198);for(const x of [0,.1,.2,.3,.4])b+=txt(X(x),232,pct(x),24,C.ink,'middle');
 b+=line(X(P),52,X(P),191,C.rose,2,'stroke-dasharray="5 5"')+smath(X(P)-90,5,tex`p=20\%`,24,220,40).replace('<foreignObject','<foreignObject class="v5-rose-math"');
 b+=`<g data-recentre-bar data-from="${X(k===1?P:c)}" data-to="${X(c)}">`;
 b+=line(X(c-E),y,X(c+E),y,C.teal,5)+line(X(c-E),y-9,X(c-E),y+9,C.teal,3)+line(X(c+E),y-9,X(c+E),y+9,C.teal,3);
 b+=line(X(c),65,X(c+E),65,C.rose,3)+line(X(c),57,X(c),73,C.rose,2)+line(X(c+E),57,X(c+E),73,C.rose,2)+smath(X(c+E/2),22,tex`\text{Margin }E`,23,230,40).replace('<foreignObject','<foreignObject class="v5-rose-math"')+'</g>';
 b+=`<circle cx="${X(.18)}" cy="${y}" r="7" fill="${C.teal}"/>`+smath(X(.18),135,tex`\widehat p=18\%`,24,240,44);
 const equations=[tex`p-E\le\widehat p\le p+E`,tex`|\widehat p-p|\le E\quad\Longleftrightarrow\quad\widehat p-E\le p\le\widehat p+E`,tex`E=1.96\,\mathrm{SE}(\widehat p),\qquad\mathrm{SE}(\widehat p)=\sqrt{\frac{p(1-p)}n}`];
 return `<p class="lead">${k===0?`A range of estimates around ${math(tex`p`)}.`:k===1?'The same distance, read from the estimate.':`The remaining difficulty: the margin still uses ${math(tex`p`)}.`}</p>`+svg(b,1152,250,'An interval with its half-width marked Margin E, first centred on true prevalence, then on the observed estimate.')+`<div class="v4-equation">${math(equations[k],true)}</div><p class="medium center v4-support">${k===0?math(tex`E=1.96\times\mathrm{SE}`):k===1?'The two inequalities describe the same event.':`In practice, ${math(tex`p`)} is unknown. We estimate the standard error.`}</p><p class="bottomline">${k===0?`About 95% of possible estimates fall within this distance of ${math(tex`p`)}.`:k===1?`The interval moves with the sample, while ${math(tex`p`)} stays fixed.`:'The next calculation uses only the sample.'}</p>`;
}
slides[13].render=v5Recentre;

function v5AlphaBell(k){
 const X=z=>126+(z+4)/8*900,Y=d=>218-d/.55*192;
 const area=(lo,hi)=>`M${X(lo)},218 `+Array.from({length:201},(_,i)=>{const z=mix(lo,hi,i/200);return `L${X(z)},${Y(density(z,0,1))}`;}).join(' ')+` L${X(hi)},218Z`;
 let b=`<path d="${area(-4,-Z95)} ${area(Z95,4)}" fill="${C.rose}" opacity=".17"/><path d="${area(-Z95,Z95)}" fill="${C.teal}" opacity=".21"/><path d="${pathCurve(X,Y,-4,4,0,1)}" fill="none" stroke="${C.rose}" stroke-width="3.5"/>`;
 b+=line(X(-4),218,X(4),218)+line(X(0),45,X(0),218,C.line,1,'stroke-dasharray="4 4"');
 for(const z of [-Z95,Z95])b+=line(X(z),Y(density(z,0,1)),X(z),224,C.teal,2);
 b+=smath(X(0),136,k?tex`95\%`:tex`1-\alpha`,31,220,54);
 for(const z of [-2.9,2.9])b+=smath(X(z),158,k?tex`2.5\%`:tex`\alpha/2`,25,150,50).replace('<foreignObject','<foreignObject class="v5-rose-math"');
 b+=smath(X(-Z95),230,k?tex`-1.96`:tex`z_{\alpha/2}`,24,240,50)+smath(X(Z95),230,k?tex`1.96`:tex`z_{1-\alpha/2}`,24,240,50)+txt(X(0),260,'0',23,C.ink,'middle');
 return `<svg class="chart v5-alpha-bell" viewBox="0 0 1152 285" role="img" aria-label="Standard normal reference, central area ${k?'95 percent':'1 minus alpha'}, with ${k?'2.5 percent':'alpha divided by two'} in each tail.">${b}</svg>`;
}
const v5Interval=slides[15].render;
slides[15].className+=' v5-interval';
slides[15].render=k=>{
 if(k>=2)return v5Interval(k);
 return `<p class="lead">A symmetric interval around the observed estimate.</p><div class="v4-equation">${math(k?tex`\alpha=0.05,\quad z_{1-\alpha/2}=z_{0.975}\approx1.96`:tex`\mathrm{CI}_{1-\alpha}:\quad\widehat p\pm z_{1-\alpha/2}\,\widehat{\mathrm{SE}}`,true)}</div><p class="v5-convention">In this course: ${math(tex`0<\alpha<\tfrac12`)}. Confidence level: ${math(tex`1-\alpha`)}.</p>${v5AlphaBell(k)}<p class="bottomline">${k?'5% outside, split equally between the two tails.':`${math(tex`\alpha`)} is the total area outside the central normal interval.`}</p>`;
};
;

const v5Coverage=linkedCoverageScene;
linkedCoverageScene=config=>{
 const html=v5Coverage(config);if(config.phase!==2||config.total<50)return html;
 const label=config.level;
 return html.replace(/<p class="coverage-foot"[\s\S]*?<\/p>/,`<p class="v5-coverage-guarantee">A well-calibrated ${label}% procedure produces intervals that contain the true value in about ${label}% of repeated samples.</p><p class="coverage-foot" data-linked-foot>Approximate normal intervals. The observed fraction can differ from ${label}%.</p>`);
};
;

slides[17].title='What would a 100% confidence interval be?';
slides[17].steps=3;slides[17].printSteps=[0,1,2];slides[17].className='v5-certainty';
slides[17].render=k=>{
 const X=x=>130+x*890,y=110;let b=line(X(0),193,X(1),193);
 for(const x of [0,.2,.4,.6,.8,1])b+=txt(X(x),230,pct(x),25,C.ink,'middle');
 if(k)b+=`<g data-full-range>`+line(X(0),y,X(1),y,C.teal,5)+line(X(0),y-12,X(0),y+12,C.teal,3)+line(X(1),y-12,X(1),y+12,C.teal,3)+txt(X(.5),67,'100% confidence: [0%, 100%]',31,C.teal,'middle')+'</g>';
 b+=`<circle cx="${X(.18)}" cy="${y}" r="8" fill="${C.teal}"/>`+smath(X(.18),132,tex`\widehat p=18\%`,26,270,44);
 return `<p class="lead">What if we want to be sure to include the true proportion?</p>`+svg(b,1152,255,'Observed estimate 18 percent. The 100 percent interval extends from zero to one and covers every possible prevalence.')+`<div class="v5-certainty-reading ${showIf(k)}"><p>Every proportion lies between 0% and 100%.</p><p class="${showIf(k>=2)}">We need no data to say this. It does not tell us where the true value lies.</p></div><p class="bottomline">${k>=2?'With the same data, confidence and precision involve a trade-off.':k?'This interval always contains the true proportion.':'We have one observed estimate. How wide must the interval be?'}</p>`;
};
;

slides[18].className+=' v5-mean';
slides[18].render=k=>`<p class="lead">Systolic blood pressure in 100 adults</p><p class="medium muted">We want to estimate the population mean ${math(tex`\mu`)}.</p><div class="cols mean-summaries"><div><p class="medium">Sample mean</p><div class="formula">${math(tex`\overline x=\frac1{100}\sum_{i=1}^{100}x_i`,true)}${math(tex`=125\text{ mmHg}`,true)}</div></div><div><p class="medium">Sample standard deviation</p><div class="formula">${math(tex`\widehat\sigma=\sqrt{\frac1{100-1}\sum_{i=1}^{100}(x_i-\overline x)^2}`,true)}${math(tex`=15\text{ mmHg}`,true)}</div></div></div><div class="rule"></div><div class="${showIf(k>=1)}"><p class="medium">Estimated standard error of the mean</p><div class="formula center">${math(tex`\widehat{\mathrm{SE}}=\frac{\widehat\sigma}{\sqrt n}=\frac{15}{\sqrt{100}}=1.5\text{ mmHg}`,true)}</div></div><div class="mean-result ${showIf(k>=2)}"><p class="medium">Approximate 95% confidence interval</p><div class="formula center">${math(tex`125\pm1.96\times1.5\quad:\quad[122.1,\ 127.9]\text{ mmHg}`,true)}</div></div><p class="bottomline">${k<2?'SD describes individual values. SE describes the uncertainty of the estimated mean.':`${math(tex`E=2.94\text{ mmHg}`)}. The same interval construction applies to a mean.`}</p>`;
;
;

const v5Planning=slides[19].render;
slides[19].render=k=>v5Planning(k).replace('Choose a confidence level, a target margin E and a planning prevalence.',k===0?'Given a confidence level, a prevalence and a sample size, we can calculate the margin of error.':'What sample size do we need to keep the margin of error below a chosen value?').replace('The margin is a quantile times a standard error. Solve this relation for n.','Now reverse the question: fix the margin of error and find the sample size.');
;
slides[21].render=k=>`<p class="lead">A 95% confidence procedure covers the true value in about 95% of repetitions, when well calibrated.</p><div class="reading-lines"><p>For a particular interval, the true value may or may not be inside.</p></div><div class="closing-question ${showIf(k)}"><p class="medium rose">What if we want to test whether the true prevalence equals a particular value?</p><p class="medium">Hypothesis tests address this question using p-values.</p></div><p class="bottomline">${k?'Tests also rely on the sampling model to control error rates.':'The guarantee concerns the procedure across repeated samples.'}</p>`;

for(const s of slides){const f=s.render;s.render=(...args)=>v4Percent(f(...args));}
Object.assign(window.DECK,{slides,samplingPicture,compactSamplingContext});

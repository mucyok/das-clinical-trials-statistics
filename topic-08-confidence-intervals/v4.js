 


const v4Percent=t=>t.replace(/percentage points|percent points/g,'%').replace(/(\d)\s+%/g,'$1%');
const v4Original=slides.slice();


function samplingPicture(index=0,phase=0,historyCount=0){
 const {population,selections}=sampleIllustration,selected=selections[index],chosen=new Set(selected),d=draws[index];
 const origin=i=>[38+i%25*17,90+Math.floor(i/25)*17],shift=650;
 let b=txt(28,30,'Population',31)+txt(28,64,'True prevalence: 20%',25,C.rose);
 b+=`<rect x="22" y="75" width="440" height="356" rx="3" fill="none" stroke="${C.line}"/>`;
 population.forEach((v,i)=>{const [x,y]=origin(i),moved=phase>=2&&chosen.has(i);b+=`<circle cx="${x}" cy="${y}" r="5.5" fill="${moved?'white':v?C.teal:C.pale}" stroke="${moved?C.line:'none'}"/>`;});
 if(phase>0){
  b+=txt(886,30,'Random sample: 100 adults',29,C.ink,'middle');
  b+=arrow(490,235,639,235)+txt(565,205,phase===1?'Selection':'Same positions',21,C.teal,'middle');
  if(phase>=2)b+=`<rect x="672" y="75" width="440" height="356" rx="3" fill="none" stroke="${C.line}"/>`;
  selected.forEach((p,i)=>{
   const [ox,oy]=origin(p),x=ox+(phase>=2?shift:0);
   b+=`<g data-key="draw-${index}-person-${i}" data-sample-person="${i}" data-population-index="${p}" data-rigid-sample data-origin="${ox},${oy}" style="transform:translate(${x}px,${oy}px)"><circle r="8" fill="none" stroke="${C.rose}" stroke-width="${phase===1?1.5:0}"/><circle r="5.5" fill="${d.data[i]?C.teal:C.pale}"/></g>`;
  });
 }
 b+=txt(28,461,'Schematic of a large population',21,C.muted);
 if(phase>=2)b+=txt(892,462,`${d.cases} cases among 100${phase>=3?' = '+pct(d.estimate):''}`,29,C.teal,'middle');
 if(historyCount)b+=txt(1110,489,'Estimates so far: '+draws.slice(0,historyCount).map(d=>pct(d.estimate)).join('   '),23,C.teal,'end');
 return `<svg class="chart sampling-chart" viewBox="0 0 1152 500" role="img" aria-label="100 selected individuals translate together to form sample ${index+1}. Relative positions, colours and point sizes are preserved. Population prevalence 20 percent.">${b}</svg>`;
}
function compactSamplingContext(total=3){
 const index=Math.max(0,total-1),d=draws[index],selected=compactSelection(index),selection=new Set(selected);
 const origin=p=>[26+p%25*8,36+Math.floor(p/25)*3.8];
 let b=txt(20,23,'Population (p = 20%)',23)+txt(385,23,`Latest sample: ${total.toLocaleString('en')} (n = 100)`,23)+txt(906,23,'Estimate',23,C.teal,'middle');
 sampleIllustration.population.forEach((v,i)=>{const [x,y]=origin(i);b+=`<circle cx="${x}" cy="${y}" r="1.65" fill="${v?C.teal:C.pale}"/>`;if(selection.has(i))b+=`<circle data-population-selected="${i}" cx="${x}" cy="${y}" r="2.7" fill="none" stroke="${C.rose}" stroke-width=".7"/>`;});
 b+=arrow(271,67,355,67)+arrow(655,67,735,67);
 selected.forEach((p,i)=>{const [x,y]=origin(p),v=d.data[i];b+=`<circle data-mini-person="${i}" data-population-index="${p}" data-case="${v}" cx="${x+380}" cy="${y}" r="1.65" fill="${v?C.teal:C.pale}"/>`;});
 b+=smath(930,43,tex`\widehat p=\frac{${d.cases}}{100}=${pct(d.estimate).replace('%','\\%')}`,27,355,60)+txt(906,109,'One value enters the histogram',21,C.muted,'middle');
 return `<svg class="chart compact-sampling-chart" data-current-sample="${index}" data-current-cases="${d.cases}" viewBox="0 0 1152 118" role="img" aria-label="Latest sample ${total}, ${d.cases} cases among 100. The selected points keep the same relative positions as in the population.">${b}</svg>`;
}
for(const i of [4,6,7]);


const v4X=z=>126+(z+4)/8*900,v4Y=d=>233-d/.55*192;
function v4Area(lo,hi){
 lo=Math.max(-4,lo);hi=Math.min(4,hi);
 const points=Array.from({length:241},(_,i)=>mix(lo,hi,i/240));
 return `M${v4X(lo)},233 ${points.map(z=>`L${v4X(z)},${v4Y(density(z,0,1))}`).join(' ')} L${v4X(hi)},233Z`;
}
function v4Bell({lo=-4,hi=4,label='',tails='',subtract=null,marks=[],units='standard',hist=false,alpha=false}={}){
 let b='';
 if(hist){
  const counts=Array(101).fill(0);draws.forEach(d=>counts[d.cases]++);
  counts.forEach((c,k)=>{const a=Math.max(-4,(k/100-.005-P)/SE),z=Math.min(4,(k/100+.005-P)/SE);if(c&&z>a){const h=c/1000/.01*SE;b+=`<rect data-v4-hist="${k}" data-count="${c}" x="${v4X(a)}" y="${v4Y(h)}" width="${v4X(z)-v4X(a)-.5}" height="${233-v4Y(h)}" fill="${C.teal}" opacity=".24"/>`;}});
 }
 if(tails)b+=`<path d="${v4Area(-4,lo)} ${v4Area(hi,4)}" fill="${C.rose}" opacity=".14"/>`;
 b+=`<path data-v4-region data-lo="${lo}" data-hi="${hi}" d="${v4Area(lo,hi)}" fill="${C.teal}" opacity=".21"/>`;
 if(subtract!==null)b+=`<path data-v4-subtract d="${v4Area(-4,subtract)}" fill="${C.rose}" opacity=".38"/>`;
 b+=`<path data-v4-bell d="${pathCurve(v4X,v4Y,-4,4,0,1)}" fill="none" stroke="${C.rose}" stroke-width="3.5"/>`;
 b+=line(126,233,1026,233)+line(v4X(0),48,v4X(0),233,C.line,1,'stroke-dasharray="4 4"');
 for(const z of [-4,-3,-2,-1,0,1,2,3,4]){
  const value=units==='standard'?String(z):units==='symbolic'?(z===0?'p':''):pct(P+SE*z);
  b+=line(v4X(z),233,v4X(z),239)+txt(v4X(z),265,value,23,z===0?C.rose:C.ink,'middle','data-v4-tick');
 }
 for(const z of marks){
  b+=line(v4X(z),v4Y(density(z,0,1)),v4X(z),241,C.teal,2);
  if(units==='symbolic')b+=smath(v4X(z),284,z<0?tex`p-z_{0.975}\,\mathrm{SE}`:tex`p+z_{0.975}\,\mathrm{SE}`,22,370,50);
  else b+=txt(v4X(z),307,units==='standard'?Number(z.toFixed(3)):pct(P+SE*z),23,C.teal,'middle','data-v4-cutoff');
 }
 if(label)b+=txt(v4X(Math.max(-.8,Math.min(.8,(lo+hi)/2))),198,label,31,C.teal,'middle','data-v4-area-label');
 if(tails){b+=txt(v4X(-2.9),208,tails,23,C.rose,'middle')+txt(v4X(2.9),208,tails,23,C.rose,'middle');}
 b+=txt(1026,348,units==='standard'?'Z':units==='symbolic'?'Sample proportion':'Estimated prevalence',23,C.ink,'end');
 return `<svg class="chart v4-bell" data-v4-chart data-units="${units}" viewBox="0 0 1152 355" role="img" aria-label="${units==='standard'?'Standard normal, mean zero and SD one':'Normal approximation for sample proportions, mean 20 percent and SE 4 percent'}. Shaded region ${label}. ${hist?'The same 1000 simulated estimates appear behind the approximation.':''}">${b}</svg>`;
}
function v4AreaSnapshot(){const e=document.querySelector('#stage [data-v4-region]');return e?{lo:+e.dataset.lo,hi:+e.dataset.hi,units:e.closest('svg').dataset.units}:null;}
function animateV4(before){
 const area=stage.querySelector('[data-v4-region]');
 if(area&&before){const target=[+area.dataset.lo,+area.dataset.hi],from=[before.lo,before.hi],start=performance.now();
  if(from.some((v,i)=>v!==target[i])){const labels=[...stage.querySelectorAll('[data-v4-area-label]')];labels.forEach(e=>e.style.visibility='hidden');
   const frame=now=>{if(!area.isConnected)return;const t=clamp((now-start)/1050),e=t*t*(3-2*t),bounds=from.map((v,i)=>mix(v,target[i],e));area.setAttribute('d',v4Area(...bounds));area.dataset.motionProgress=t;if(t<1)requestAnimationFrame(frame);else labels.forEach(e=>e.style.visibility='visible');};requestAnimationFrame(frame);
  }
  if(before.units!==area.closest('svg').dataset.units)stage.querySelectorAll('[data-v4-tick],[data-v4-cutoff],foreignObject').forEach(e=>e.animate([{opacity:0},{opacity:1}],{duration:1000}));
 }
 stage.querySelectorAll('[data-v4-subtract],[data-v4-hist]').forEach(e=>e.animate([{opacity:0},{opacity:e.hasAttribute('data-v4-hist')?.24:.38}],{duration:1100}));
 const bar=stage.querySelector('[data-recentre-bar]');
 if(bar){const a=+bar.dataset.from,b=+bar.dataset.to;bar.animate([{transform:`translateX(${a-b}px)`},{transform:'translateX(0px)'}],{duration:1300,easing:'ease-in-out'});}
}
const v4StandardLine=`<p class="v4-reference">${math(tex`Z\sim\mathcal N(0,1)`)} <span>Mean = 0 &nbsp; Variance = 1 &nbsp; SD = 1</span></p>`;
function v4Standard(k){
 const config=[{label:'100%'},{hi:0,label:'50%'},{lo:-1,hi:1,label:'≈ 68%',marks:[-1,1]},{lo:-2,hi:2,label:'≈ 95%',marks:[-2,2]}][k];
 return v4StandardLine+v4Bell(config)+`<div class="v4-equation">${math([tex`\Pr(Z\in\mathbb R)=1`,tex`\Pr(Z<0)=0.5`,tex`\Pr(-1<Z<1)\approx0.68`,tex`\Pr(-2<Z<2)\approx0.9545`][k],true)}</div><p class="bottomline">${['Areas under the curve give probabilities.','The normal is symmetric. Its mean and median are both zero.','One SD on each side of the mean contains about 68% of the distribution.','Two SDs give about 95%. Quantiles will give the cutoffs for exactly 95%.'][k]}</p>`;
}
function v4Quantiles(k){
 const a=.6744897501960817,b=1.6448536269514722;
 const opts=[{hi:a,label:'75%',marks:[a]},{hi:a,subtract:-a,label:'',marks:[-a,a]},{lo:-a,hi:a,label:'50%',marks:[-a,a]},{hi:b,label:'95%',marks:[b]},{lo:-b,hi:b,label:'90%',tails:'5%',marks:[-b,b]},{lo:-Z95,hi:Z95,label:'95%',tails:'2.5%',marks:[-Z95,Z95]}][k];
 const equations=[tex`\Pr(Z\le z_q)=q,\quad0<q<1;\qquad z_{0.75}\approx0.674`,tex`q_1=0.25,\quad q_2=0.75\qquad q_2-q_1=0.50`,tex`\Pr(z_{q_1}<Z\le z_{q_2})=q_2-q_1`,tex`z_{0.95}\approx1.645\qquad\Pr(Z\le z_{0.95})=0.95`,tex`\Pr(z_{0.05}<Z<z_{0.95})=0.90`,tex`\Pr(z_{0.025}<Z<z_{0.975})=0.95`];
 const captions=['q is a probability. The quantile zq is its cutoff on the horizontal axis.','Start with the 75% area. The rose area marks the 25% to subtract.','Subtracting the two cumulative areas leaves the area between the cutoffs.','A 95% quantile leaves 5% on its right. It is about 1.645, not 1.96.','The 5% and 95% quantiles enclose the central 90%.','The central 95% uses the 2.5% and 97.5% quantiles, approximately −1.96 and +1.96.'];
 return `<p class="v4-reference">${math(tex`Z\sim\mathcal N(0,1)`)} <span>Quantiles from a table or numerical calculation</span></p>`+v4Bell(opts)+`<div class="v4-equation">${math(equations[k],true)}</div><p class="bottomline">${captions[k]}</p>`;
}
function v4Relabel(k){
 const units=k===0?'standard':k===1?'symbolic':'proportion',hist=k===3,w=empiricalWindow(1000,P-Z95*SE,P+Z95*SE);
 const head=k===0?math(tex`Z\sim\mathcal N(0,1)`):math(tex`\widehat p\ \overset{\text{approx.}}{\sim}\ \mathcal N(p,\mathrm{SE}^2)`);
 return `<p class="v4-reference">${head}<span>${k===0?'The central 95%':k===1?'New units: multiply by SE, then add p':'p = 20%, n = 100, SE = 4%'}</span></p>`+v4Bell({lo:-Z95,hi:Z95,label:k===0?'95%':'≈ 95%',marks:[-Z95,Z95],units,hist})+`<div class="v4-equation">${math(k===0?tex`\Pr(-z_{0.975}<Z<z_{0.975})=0.95`:k===1?tex`\Pr\!\left(p-z_{0.975}\mathrm{SE}\le\widehat p\le p+z_{0.975}\mathrm{SE}\right)\approx0.95`:tex`\Pr(12.16\%\le\widehat p\le27.84\%)\approx0.95`,true)}</div><p class="bottomline">${k===0?'Follow the centre and the two cutoffs.':k===1?'Same bell on screen, new numerical scale. The sampling approximation adds ≈.':k===2?'A range of possible estimates around the known population value.':`${w.hits} / 1,000 simulated estimates fall in this range. The histogram is only approximately normal.`}</p>`;
}
function v4Recentre(k){
 const X=x=>135+x/.4*890,E=Z95*SE,centre=k===0?P:.18,y=99;
 let b=line(X(0),180,X(.4),180);for(const x of [0,.1,.2,.3,.4])b+=txt(X(x),216,pct(x),24,C.ink,'middle');
 b+=line(X(P),25,X(P),168,C.rose,2,'stroke-dasharray="5 5"')+txt(X(P),17,'p = 20%',23,C.rose,'middle');
 b+=`<g data-recentre-bar data-from="${X(k===1?P:centre)}" data-to="${X(centre)}">`+line(X(centre-E),y,X(centre+E),y,C.teal,5)+line(X(centre-E),y-9,X(centre-E),y+9,C.teal,3)+line(X(centre+E),y-9,X(centre+E),y+9,C.teal,3)+'</g>';
 b+=`<circle cx="${X(.18)}" cy="${y}" r="7" fill="${C.teal}"/>`+txt(X(.18),142,'estimate = 18%',24,C.teal,'middle');
 const equations=[tex`p-E\le\widehat p\le p+E`,tex`|\widehat p-p|\le E\quad\Longleftrightarrow\quad\widehat p-E\le p\le\widehat p+E`,tex`E=1.96\,\mathrm{SE}(\widehat p),\qquad\mathrm{SE}(\widehat p)=\sqrt{\frac{p(1-p)}n}`];
 return `<p class="lead">${k===0?'A range of estimates around p.':k===1?'The same distance, read from the estimate.':'The remaining difficulty: the margin still uses p.'}</p>`+svg(b,1152,240,'The same margin recentred from the fixed prevalence to the observed estimate. The population value stays at 20 percent.')+`<div class="v4-equation">${math(equations[k],true)}</div><p class="medium center v4-support">${k===0?'Here E = 1.96 × SE.':k===1?'The two inequalities describe the same event.':'In practice, p is unknown. We need to estimate the standard error.'}</p><p class="bottomline">${k===0?'About 95% of possible estimates fall within this distance of p.':k===1?'Now the interval moves with the sample, while p stays fixed.':'This illustration used the known simulation value. The next calculation uses only the sample.'}</p>`;
}
function v4Interval(k){
 const formulas=[tex`\mathrm{IC}_{1-\alpha}:\quad\widehat p\pm z_{1-\alpha/2}\,\widehat{\mathrm{SE}}`,tex`\alpha=0.05,\quad\alpha/2=0.025,\quad z_{1-\alpha/2}=z_{0.975}\approx1.96`,tex`18\%\pm1.96\times3.84\%\quad\Rightarrow\quad[10.5\%,\ 25.5\%]`,tex`E=z_{1-\alpha/2}\,\widehat{\mathrm{SE}}\approx7.53\%`];
 return `<p class="lead">${k<2?'A symmetric interval around the observed estimate.':'One sample: 18 cases among 100 people.'}</p><div class="v4-equation">${math(formulas[k],true)}</div>`+(k<2?`<div class="v4-alpha"><p class="medium center">${math(tex`0<\alpha<1`)} &nbsp; Confidence level: ${math(tex`1-\alpha`)}</p><div class="v4-tail-strip"><span>${k?'2.5%':'α/2'}</span><strong>${k?'95%':'1 − α'}</strong><span>${k?'2.5%':'α/2'}</span></div><p class="medium center">${k?'5% outside, split equally between the two tails.':'α is the total area left outside the central normal interval.'}</p></div>`:marginPicture(k))+`<p class="bottomline">${k===0?'A normal-approximation interval. The standard error is estimated from the sample.':k===1?'The confidence level is 95%. The upper quantile is 97.5%.':k===2?'The interval is centred on 18%, with an estimated standard error of 3.84%.':'The margin of error is the half-width of the interval.'}</p>`;
}
function v4Levels(k){
 const levels=[80,95,99,100],X=x=>285+x*790,rows=levels.slice(0,k+1);
 let b='';rows.forEach((level,i)=>{const d=level===100?{lo:0,hi:1}:ci(.18,100,confidenceLevels[level].z),y=52+i*91;b+=txt(30,y+8,`${level}% confidence`,26)+line(X(d.lo),y,X(d.hi),y,level===100?C.rose:C.teal,4)+line(X(d.lo),y-7,X(d.lo),y+7,C.teal,2)+line(X(d.hi),y-7,X(d.hi),y+7,C.teal,2)+`<circle cx="${X(.18)}" cy="${y}" r="6" fill="${C.teal}"/>`+txt(X(d.lo),y+34,pct(d.lo),22,C.muted,'middle')+txt(X(d.hi),y+34,pct(d.hi),22,C.muted,'middle');});
 b+=line(X(0),387,X(1),387);for(const x of [0,.2,.4,.6,.8,1])b+=txt(X(x),420,pct(x),23,C.ink,'middle');
 return `<p class="medium">Same sample, same estimate: 18%. Only the confidence level changes.</p>`+svg(b,1152,438,'Intervals at 80, 95 and 99 percent confidence for the same sample, and the separate trivial 100 percent interval from zero to one. Every row shares the same horizontal scale.')+`<p class="bottomline">${k<3?'Higher confidence requires a wider interval, with the same data.':'100%: [0%, 100%] always contains p. It gives no information beyond the possible range.'}</p>`;
}

const v4Block=[
 {title:'The central limit theorem and standard error',minutes:2.5,steps:3,printSteps:[1,2],className:'v4-theorem',render:k=>`<p class="medium">${math(tex`\widehat p`)} averages n independent 0/1 observations with the same probability p.</p><p class="medium">For large n <span class="muted">(people in each sample)</span></p><div class="v4-equation">${math(tex`\widehat p\ \overset{\text{approx.}}{\sim}\ \mathcal N\!\left(p,\frac{p(1-p)}n\right)`,true)}</div><div class="parameter-line">${math(tex`\text{Mean}=p`)} &nbsp; ${math(tex`\text{Variance}=p(1-p)/n`)}</div><div class="${showIf(k>=1)}"><div class="v4-equation">${math(tex`\mathrm{SE}(\widehat p)=\mathrm{SD}(\widehat p)=\sqrt{\frac{p(1-p)}n}`,true)}</div></div><div class="${showIf(k>=2)}"><table class="v4-table"><thead><tr><th>p = 20%</th><th>Variance of ${math(tex`\widehat p`)}</th><th>SE of ${math(tex`\widehat p`)}</th></tr></thead><tbody>${[25,100,400].map(n=>`<tr><td>n = ${n}</td><td>${(.16/n).toFixed(4)}</td><td>${pct(Math.sqrt(.16/n))}</td></tr>`).join('')}</tbody></table></div><p class="bottomline">${k<2?'The standard error is the SD of the estimator across possible samples.':'Four times as many people halves the standard error.'}</p>`},
 {title:'The standard normal distribution',minutes:2,steps:4,printSteps:[0,1,2,3],className:'v4-normal',render:v4Standard},
 {title:'Normal quantiles and central intervals',minutes:3.5,steps:6,printSteps:[0,1,2,3,4,5],className:'v4-normal v4-quantiles',render:v4Quantiles},
 {title:'The normal approximation on the prevalence scale',minutes:2.5,steps:4,printSteps:[0,1,2,3],className:'v4-normal v4-relabel',render:v4Relabel},
 {title:'An interval centred on the estimate',minutes:1.5,steps:3,printSteps:[0,1,2],className:'v4-recentre',render:v4Recentre},
 {...v4Original[14]},
 {title:'A confidence interval and its margin of error',minutes:2.5,steps:4,printSteps:[0,1,2,3],className:'v4-interval',render:v4Interval},
 {...v4Original[16]},
 {title:'Confidence level and interval width',minutes:1.5,steps:4,printSteps:[2,3],className:'v4-levels',render:v4Levels},
 {...v4Original[17]},
 {...v4Original[18]},
 {...v4Original[19]},
 {title:'Estimation and a new question',minutes:1.5,steps:2,printSteps:[0,1],className:'closing-slide v4-closing',render:k=>`<p class="lead">One sample gives an estimate and information about its precision.</p><div class="reading-lines"><p>A well-calibrated 95% confidence procedure covers the true value in about 95% of repetitions.</p><p>The sample changes. The interval changes. The population value stays fixed.</p></div><div class="closing-question ${showIf(k)}"><p class="medium rose">Are our data compatible with a specified population value?</p><p class="medium">For example, could the true prevalence be 20%?</p><p class="medium">Hypothesis tests address this question using a p-value.</p></div><p class="bottomline">${k?'A different question for the same data. Tests also have sampling-based error guarantees.':'Repeated sampling explains the guarantee. We do not need to collect many samples to use an interval.'}</p>`}
];
slides.splice(9,slides.length-9,...v4Block);
const v4Planning=slides.find(s=>s.title==='Planning a sample size');
v4Planning.steps=4;v4Planning.printSteps=[0,1,2,3];v4Planning.className='planning-slide v4-planning';
v4Planning.render=k=>`<p class="medium">Choose a confidence level, a target margin E and a planning prevalence.</p><div class="v4-equation">${math(k===0?tex`E=z_{1-\alpha/2}\sqrt{\frac{p_{\rm plan}(1-p_{\rm plan})}{n}}`:tex`n\ge\frac{z_{1-\alpha/2}^{\,2}\,p_{\rm plan}(1-p_{\rm plan})}{E^2}`,true)}</div><div class="rule"></div><div class="${showIf(k>=1)}"><p class="medium center">95% confidence, planning prevalence 20%</p><div class="v4-equation">${math(k>=2?tex`E=2\%:\quad n\ge1536.64\quad\Rightarrow\quad n=1537`:tex`E=4\%:\quad n\ge384.16\quad\Rightarrow\quad n=385`,true)}</div></div><p class="medium center v4-support ${showIf(k>=3)}">Use previous evidence or a pilot study.<br>If no planning estimate is available, use p = 50% for the largest variance.</p><p class="bottomline">${k===0?'The margin is a quantile times a standard error. Solve this relation for n.':k===1?'Round up. This plans precision under the sampling model.':k===2?'Half the target margin requires about four times as many people.':'We plan before collecting the new sample. This is a precision calculation, not a power calculation.'}</p>`;
;

for(const s of slides){const render=s.render;s.render=(...args)=>v4Percent(render(...args));;}

const v4LinkedScene=linkedCoverageScene;
linkedCoverageScene=(...args)=>v4Percent(v4LinkedScene(...args));
const v4MarginPicture=marginPicture;
marginPicture=(...args)=>v4Percent(v4MarginPicture(...args));
Object.assign(window.DECK,{slides,v4Bell,v4Area,v4Relabel,v4Percent});

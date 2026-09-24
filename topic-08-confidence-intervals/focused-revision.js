 
Object.assign(slides[5],{className:'estimator-function-slide',render:k=>`<p class="lead">An estimator is a function of the sample data.</p><p class="coding-line">Disease status: 1 = present, 0 = absent.</p><div class="${showIf(k>=1)}"><p class="medium teal">Estimator: the rule for any sample</p><div class="formula center">${math(tex`\widehat p=g(X_1,\ldots,X_n)=\frac{X_1+\cdots+X_n}{n}`,true)}</div><p class="medium center">Input: sample data. Output: a proportion.</p></div><div class="rule"></div><div class="${showIf(k>=2)}"><p class="medium">Estimate: the value obtained from the observed data</p><div class="formula center">${math(tex`g(x_1,\ldots,x_{100})=\frac{18}{100}=18\%`,true)}</div><p class="estimate-result center teal">Same function. With these data, the estimate is 18%.</p></div>`});

const compactSelectionCache=new Map(sampleIllustration.selections.map((s,i)=>[i,s]));
function compactSelection(index){
 if(!compactSelectionCache.has(index)){
  const r=rng(1600+index),available=[[],[]];
  sampleIllustration.population.forEach((v,i)=>available[v].push(i));
  const selected=draws[index].data.map(v=>available[v].splice(Math.floor(r()*available[v].length),1)[0]);
  compactSelectionCache.set(index,selected);
 }
 return compactSelectionCache.get(index);
}
function compactSamplingContext(total=3){
 const index=Math.max(0,total-1),d=draws[index],selection=new Set(compactSelection(index));
 let b=txt(20,23,'Population (p = 20%)',23)+txt(396,23,`Latest sample: ${total.toLocaleString('en')} (n = 100)`,23)+txt(846,23,'Estimate',23,C.teal,'middle');
 sampleIllustration.population.forEach((v,i)=>{
  const x=26+i%25*8,y=36+Math.floor(i/25)*3.8;
  b+=`<circle cx="${x}" cy="${y}" r="1.65" fill="${v?C.teal:C.pale}"/>`;
  if(selection.has(i))b+=`<circle data-population-selected="${i}" cx="${x}" cy="${y}" r="2.7" fill="none" stroke="${C.rose}" stroke-width=".7"/>`;
 });
 b+=arrow(271,67,355,67)+arrow(603,67,672,67);
 d.data.forEach((v,i)=>b+=`<circle data-mini-person="${i}" data-case="${v}" cx="${418+i%10*7.6}" cy="${39+Math.floor(i/10)*7.6}" r="2.8" fill="${v?C.teal:C.pale}"/>`);
 b+=smath(847,42,tex`\widehat p=\frac{${d.cases}}{100}=${pct(d.estimate).replace('%','\\%')}`,29,390,62)+txt(846,109,'One value enters the histogram',22,C.muted,'middle');
 return `<svg class="chart compact-sampling-chart" data-current-sample="${index}" data-current-cases="${d.cases}" viewBox="0 0 1152 118" role="img" aria-label="The same sampling process continues. Latest sample ${total}: ${d.cases} cases among 100 people, giving an estimate of ${pct(d.estimate)}. The population icons schematise the population.">${b}</svg>`;
}
function countedHistogram(total=1000,range=null){
 const X=x=>100+x/.4*970,B=217,Y=c=>B-c/130*156;
 const counts=Array(101).fill(0);draws.slice(0,total).forEach(d=>counts[d.cases]++);
 let b=txt(1070,30,`${total.toLocaleString('en')} estimates in the histogram`,24,C.ink,'end');
 if(range)b+=`<rect x="${X(range[0]-.005)}" y="49" width="${X(range[1]+.005)-X(range[0]-.005)}" height="168" fill="${C.teal}" opacity=".055"/>`;
 for(const v of [0,50,100])b+=line(100,Y(v),1070,Y(v),'#e4ebec',1)+txt(83,Y(v)+7,v,22,C.muted,'end');
 counts.slice(0,41).forEach((c,i)=>{
  const hit=range&&i/100>=range[0]-1e-10&&i/100<=range[1]+1e-10;
  b+=`<rect data-count-bin="${i}" data-count="${c}" data-in-window="${!!hit}" x="${X(Math.max(0,(i-.5)/100))+.6}" y="${Y(c)}" width="${970/.4*.01-1.2}" height="${B-Y(c)}" fill="${C.teal}" opacity="${!range||hit?.8:.18}"/>`;
 });
 b+=line(100,B,1070,B)+line(X(P),48,X(P),B,C.rose,2,'stroke-dasharray="5 5"')+txt(X(P),43,'p = 20%',23,C.rose,'middle');
 for(const v of [0,.1,.2,.3,.4])b+=txt(X(v),249,pct(v),24,C.ink,'middle');
 b+=txt(1070,282,'Estimated prevalence',24,C.ink,'end');
 if(range)for(const x of range)b+=line(X(x),B+4,X(x),B+13,C.teal,2);
 return `<svg class="chart counted-histogram" data-histogram-baseline="${B}" viewBox="0 0 1152 292" role="img" aria-label="Histogram of ${total} estimates, one for each independent sample of 100 people.">${b}</svg>`;
}
function histogramReading(k,total=k?1000:3){
 const range=k>=3?[.12,.28]:k>=2?[.16,.24]:null,summary=range?empiricalWindow(total,...range):null;
 return `<p class="medium">The same process continues: one sample, one estimate.</p><div data-sampling-context>${compactSamplingContext(total)}</div><div data-counted-plot>${countedHistogram(total,range)}</div><p class="empirical-readout" data-counted-readout>${summary?`${summary.hits} / ${total.toLocaleString('en')} estimates between ${pct(range[0])} and ${pct(range[1])} (${(100*summary.fraction).toFixed(1)}%)`:`${total.toLocaleString('en')} samples, ${total.toLocaleString('en')} estimates`}</p><div class="story-controls"><button data-story-run>${total>=1000?'Replay sampling':'Continue sampling'}</button><button data-story-all>Show 1,000</button></div><p class="bottomline">${range?'A wider range around 20% contains more of the estimates.':'The population stays fixed. The estimate changes with the sample.'}</p>`;
}
slides[7].className+=' sampling-context-slide';
;

const comparisonSizes=[5,100,400];
function sizeRow(n,normal=true){
 const data=n===400?samples(400,1000,400):ensemble(n),sd=Math.sqrt(.16/n),L=110,R=715,T=14,B=101,low=0,high=.4,X=x=>L+(x-low)/(high-low)*(R-L),width=1/n;
 const counts=Array(n+1).fill(0);data.forEach(d=>counts[d.cases]++);
 const bins=counts.flatMap((c,k)=>{
  if(!c)return [];
  const a=Math.max(low,k/n-width/2),z=Math.min(high,k/n+width/2);
  if(z<=a)return [];
  
  return [{c,k,a,z,d:c/data.length/width}];
 });
 const ymax=Math.max(density(P,P,sd),...bins.map(b=>b.d))*1.13,Y=d=>B-d/ymax*(B-T);
 let b=txt(0,53,`n = ${n}`,27);
 for(const {c,k,a,z,d} of bins)b+=`<rect data-size-bin="${n}-${k}" data-density="${d}" data-bin-width="${z-a}" data-natural-width="${width}" data-count="${c}" x="${X(a)}" y="${Y(d)}" width="${X(z)-X(a)}" height="${B-Y(d)}" fill="${C.teal}" opacity=".46" stroke="white" stroke-width=".45"/>`;
 if(normal)b+=`<path data-size-normal="${n}" d="${pathCurve(X,Y,low,high,P,sd)}" fill="none" stroke="${C.rose}" stroke-width="3"/>`;
 b+=line(L,B,R,B)+line(X(0),T,X(0),B,C.line,1,'stroke-dasharray="2 4"')+line(X(P),T,X(P),B,C.line,1,'stroke-dasharray="4 4"');
 for(let i=0;i<=8;i++){const x=i/20;b+=line(X(x),B,X(x),B+4)+`<text data-size-tick="${x}" x="${X(x)}" y="125" font-size="20" fill="${C.ink}" text-anchor="middle">${pct(x)}</text>`;}
 if(normal)b+=`<foreignObject x="768" y="3" width="372" height="60"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:26px;color:${C.rose}">${math(tex`\mathcal N\!\left(0.20,\,\frac{0.16}{${n}}\right)`)}</div></foreignObject>`;
 b+=txt(783,86,`SD: ${+(sd*100).toFixed(1)} percent points`,24,C.muted);
 const outside=data.filter(d=>d.estimate>high).length;
 if(outside)b+=`<text data-outside-count="${outside}" x="783" y="120" font-size="22" fill="${C.teal}">${outside} estimates above 40% (off view)</text>`;
 return `<svg class="chart size-row" data-size-row="${n}" data-ymax="${ymax}" data-domain-min="${low}" data-domain-max="${high}" viewBox="0 0 1152 136" role="img" aria-label="${n} people per sample, 1000 estimates. Shared horizontal view from 0 to 40 percent, separate density-height scale. Normal mean 20 percent, standard error ${+(sd*100).toFixed(1)} percent points. ${outside} estimates above 40 percent are outside this view but remain in the simulation. Histogram bins and normal curve are cropped at the edges, without renormalisation.">${b}</svg>`;
}
function sizeComparison(k){
 return `<p class="medium">Same prevalence: 20%. Each row uses 1,000 estimates.</p><div class="size-rows">${comparisonSizes.slice(0,Math.min(3,k+1)).map(n=>sizeRow(n,k>=3)).join('')}</div><p class="bottomline">${k<3?'With 5 people, estimates are widely spaced. Larger samples give finer, narrower distributions.':'Rose: normal approximation, cropped at the edges. At n = 5, it is still a rough approximation.'}</p>`;
}
slides[8].className+=' discrete-comparison-slide';
slides[8].render=sizeComparison;
;
;

;

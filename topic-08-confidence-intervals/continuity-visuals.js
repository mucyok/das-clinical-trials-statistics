 
const sampleIllustration = (() => {
  const population=Array.from({length:500},(_,i)=>+(i<100)),r=rng(672);
  for(let i=499;i>0;i--){const j=Math.floor(r()*(i+1));[population[i],population[j]]=[population[j],population[i]];}
  const selections=draws.slice(0,3).map(d=>{
    const used=new Set();
    return d.data.map(v=>{const pool=population.flatMap((a,i)=>a===v&&!used.has(i)?[i]:[]),j=pool[Math.floor(r()*pool.length)];used.add(j);return j;});
  });
  return {population,selections};
})();
function samplingPicture(index=0,phase=0,historyCount=0){
  const {population,selections}=sampleIllustration,selected=selections[index],chosen=new Set(selected),d=draws[index];
  const origin=i=>[38+i%25*17,90+Math.floor(i/25)*17],destination=i=>[780+i%10*17,140+Math.floor(i/10)*17];
  let b=txt(28,30,'Population',31)+txt(28,64,'True prevalence: 20%',25,C.rose)+txt(866,30,phase>0?'Random sample: 100 adults':'',29,C.ink,'middle');
  b+=`<rect x="22" y="75" width="440" height="356" rx="3" fill="none" stroke="${C.line}"/>`;
  population.forEach((v,i)=>{const [x,y]=origin(i),moved=phase>=2&&chosen.has(i);b+=`<circle cx="${x}" cy="${y}" r="5.5" fill="${moved?'white':v?C.teal:C.pale}" stroke="${moved?C.line:'none'}"/>`;});
  if(phase>0){
    b+=arrow(500,246,712,246)+txt(605,205,phase===1?'Selected individuals':'Same individuals',24,C.teal,'middle');
    if(phase>=2)b+=`<rect x="764" y="124" width="184" height="184" rx="3" fill="none" stroke="${C.line}"/>`;
    selected.forEach((p,i)=>{
      const [ox,oy]=origin(p),[x,y]=phase>=2?destination(i):origin(p);
      b+=`<g data-key="draw-${index}-person-${i}" data-sample-person="${i}" data-origin="${ox},${oy}" style="transform:translate(${x}px,${y}px)"><circle r="${phase===1?8:7.5}" fill="none" stroke="${C.rose}" stroke-width="${phase===1?1.5:0}"/><circle r="5.5" fill="${d.data[i]?C.teal:C.pale}"/></g>`;
    });
  }
  if(phase>=2)b+=txt(860,360,`${d.cases} cases among 100`,28,C.ink,'middle');
  if(phase>=3)b+=txt(860,420,pct(d.estimate),54,C.teal,'middle');
  b+=txt(28,462,'Schematic of a large population',21,C.muted);
  if(historyCount)b+=txt(560,470,'Estimates so far: '+draws.slice(0,historyCount).map(d=>pct(d.estimate)).join('   '),25,C.teal);
  return `<svg class="chart sampling-chart" viewBox="0 0 1152 490" role="img" aria-label="A population with 20 percent prevalence and selected individuals moving into sample ${index+1}. Points keep the same size.">${b}</svg>`;
}

function standardGeometry(phase){
  const centre=.20*Math.max(0,1-phase);
  
  
  const expansion=Math.max(0,Math.min(1,phase-1)),zoom=expansion;
  const sd=.04*Math.pow(25,expansion);
  const span=.8*Math.pow(10,zoom),viewCentre=.2*(1-zoom);
  return {centre,sd,min:viewCentre-span/2,max:viewCentre+span/2,ymax:.42/sd,zoom,expansion};
}
const normalLegendCache=new Map();
function normalLegend(x,width,formula,color,align='left'){
  if(!normalLegendCache.has(formula))normalLegendCache.set(formula,math(formula));
  return `<foreignObject data-normal-legend x="${x}" y="0" width="${width}" height="49"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:29px;line-height:1.3;color:${color};text-align:${align}">${normalLegendCache.get(formula)}</div></foreignObject>`;
}
function standardPlot(phase=0,region=false){
  const g=standardGeometry(phase),X=x=>75+(x-g.min)/(g.max-g.min)*990,Y=d=>280-d/g.ymax*190;
  
  const curve=(mu,sd)=>Array.from({length:1601},(_,i)=>{const x=g.min+(g.max-g.min)*i/1600;return `${i?'L':'M'}${X(x)},${Y(density(x,mu,sd))}`;}).join(' ');
  const area=(mu,sd,lo,hi)=>`M${X(lo)},280 ${Array.from({length:181},(_,i)=>{const x=lo+(hi-lo)*i/180;return `L${X(x)},${Y(density(x,mu,sd))}`;}).join(' ')} L${X(hi)},280Z`;
  const mu=g.centre===0?'0':g.centre.toFixed(2),variance=g.sd===1?'1':`${g.sd.toFixed(2)}^{2}`;
  const normalLabel=tex`\mathcal N\!\left(${mu},\,${variance}\right)`;
  let b=normalLegend(76,510,normalLabel,C.rose)+normalLegend(745,320,tex`Z\sim\mathcal N(0,1)`,C.muted,'right');
  const operation=phase<.01?'Mean 20%, SD 4 percentage points':region?(phase<=1?'Multiply by 0.04; then add 0.20':phase>=1.999?'Standard normal: SD = 1':'Multiply by 0.04: the curve contracts'):(phase<=1?'Subtract 0.20: same spread':phase>=1.999?'Divide by 0.04: SD = 1':'Divide by 0.04: the curve expands');
  b+=txt(76,59,operation,22,C.rose);
  b+=`<path data-reference d="M75,280 ${curve(0,1)} L1065,280Z" fill="#e9edef" stroke="none"/><path d="${curve(0,1)}" fill="none" stroke="#9eacaf" stroke-width="3" stroke-dasharray="7 5"/>`;
  if(region)b+=`<path data-transform-area d="${area(g.centre,g.sd,g.centre-Z95*g.sd,g.centre+Z95*g.sd)}" fill="${C.teal}" opacity=".23"/>`;
  b+=`<path data-transform-curve d="${curve(g.centre,g.sd)}" fill="none" stroke="${C.rose}" stroke-width="4"/>`+line(X(0),81,X(0),280,C.line,1,'stroke-dasharray="4 5"')+line(75,280,1065,280);
  const span=g.max-g.min,tickStep=span<=1.2?.2:span<=3?.5:span<=6?1:2;
  for(let j=Math.ceil((g.min-1e-9)/tickStep);j*tickStep<=g.max+1e-9;j++){const x=j*tickStep;b+=line(X(x),280,X(x),287)+txt(X(x),313,Number(x.toFixed(2)),25,C.ink,'middle');}
  if(region){
    for(const sign of [-1,1]){const x=g.centre+sign*Z95*g.sd;b+=line(X(x),Y(density(x,g.centre,g.sd)),X(x),280,C.teal,2);}
    b+=txt(X(g.centre),206,phase>=1.99?'95%':'≈ 95%',30,C.teal,'middle');
  }
  b+=txt(1065,350,phase<.01?'Proportion scale: 0.20 = 20%':phase<=1?'Error on the proportion scale':phase>=1.999?'Error divided by 0.04':'Changing the error scale',23,C.ink,'end');
  b+=txt(76,387,g.zoom<.01?'Shared close-up: the wide grey reference continues beyond this view.':'Both axes adjust smoothly, with the same scales for both curves.',21,C.muted);
  return `<svg class="chart transform-chart" data-transform-phase="${phase}" data-sd="${g.sd}" data-centre="${g.centre}" viewBox="0 0 1152 404" role="img" aria-label="Both normal curves share the numerical axes. The example shifts by 0.20; rescaling and the common camera move together smoothly, without an intermediate spike. The inverse contracts the curve while zooming in.">${b}</svg>`;
}
function quantilePicture(q=.975,z=Z95,hist=false){
  return bell({scale:'standard',lo:-5,hi:z,areaLabel:(100*q)+'%',bounds:true,quantile:true,hist});
}
const confidenceLevels={80:{q:.9,z:1.2815515655446004},95:{q:.975,z:Z95},99:{q:.995,z:2.5758293035489004}};
function tailsPicture(mode='two',level=95){
  const alpha=1-level/100,z=mode==='two'?confidenceLevels[level].z:1.6448536269514722;
  const lo=mode==='lower'?-5:-z,hi=mode==='upper'?5:z;
  let b=bell({scale:'standard',lo,hi,areaLabel:level+'%',bounds:true});
  const tail=mode==='two'?alpha/2:alpha;
  const label=(100*tail).toFixed(1).replace('.0','')+'%';
  let extras='';
  if(mode!=='lower')extras+=`<path d="${areaPath(-5,-z)}" fill="${C.rose}" opacity=".18"/>`+txt(NX(-3),285,label,23,C.rose,'middle');
  if(mode!=='upper')extras+=`<path d="${areaPath(z,5)}" fill="${C.rose}" opacity=".18"/>`+txt(NX(3),285,label,23,C.rose,'middle');
  return b.replace('</svg>',extras+'</svg>');
}

const ensembleCache=new Map([[100,draws]]);
function ensemble(n){if(!ensembleCache.has(n))ensembleCache.set(n,samples(n,1000,2));return ensembleCache.get(n);}
function coverageSummary(n=100,level=95,total=1000){
  const data=ensemble(n).slice(0,total),z=confidenceLevels[level].z;
  const items=data.map(d=>{const v=ci(d.estimate,n,z);return {...v,covers:v.lo<=P&&P<=v.hi};});
  return {items,hits:items.filter(d=>d.covers).length,total,width:items.length?items.reduce((s,d)=>s+d.hi-d.lo,0)/items.length:0};
}
function exactCoverage(n,level=95){return binomial(n,P).reduce((sum,m,k)=>{const d=ci(k/n,n,confidenceLevels[level].z);return sum+(d.lo<=P&&P<=d.hi?m:0);},0);}

function approximationPlot(n=100,total=1000,{labels=false,compact=false}={}){
  const domain=compact?.4:.6,maxDensity=compact?12:24;
  const X=x=>100+x/domain*980,B=310,Y=d=>B-d/maxDensity*236,sd=Math.sqrt(P*(1-P)/n);
  const width=Math.max(1/n,.01),bins=Math.round(domain/width),counts=Array(bins+1).fill(0);
  ensemble(n).slice(0,total).forEach(d=>{const j=Math.round(d.estimate/width);if(j<=bins)counts[j]++;});
  let b='';
  
  counts.forEach((c,i)=>{if(c){const left=Math.max(0,(i-.5)*width),h=c/1000/width/maxDensity*236;b+=`<rect data-approx-bin="${i}" x="${X(left)}" y="${B-h}" width="${X((i+.5)*width)-X(left)-1}" height="${h}" fill="${C.teal}" opacity=".32"/>`;}});
  b+=`<path data-approx-curve d="${pathCurve(X,Y,0,domain,P,sd)}" fill="none" stroke="${C.rose}" stroke-width="4"/>`;
  b+=line(X(P),58,X(P),B,C.line,2,'stroke-dasharray="5 5"')+txt(X(P),40,'p = 20%',28,C.rose,'middle');
  if(labels){b+=line(X(P-sd),B-36,X(P+sd),B-36,C.ink,3)+line(X(P-sd),B-45,X(P-sd),B-27,C.ink,2)+line(X(P+sd),B-45,X(P+sd),B-27,C.ink,2)+txt(X(P),B-55,'± 1 standard error',24,C.ink,'middle');}
  b+=line(X(0),B,X(domain),B);for(const p of [0,.1,.2,.3,.4,.5,.6].filter(p=>p<=domain))b+=txt(X(p),B+32,pct(p),23,C.ink,'middle');
  b+=txt(1080,384,'Estimated prevalence',25,C.ink,'end');
  return `<svg class="chart approximation-chart" data-approx-n="${n}" viewBox="0 0 1152 402" role="img" aria-label="${total} repeated samples, ${n} observations per sample. Histogram and normal approximation centred at 20 percent, standard error ${(100*sd).toFixed(1)} percentage points.">${b}</svg>`;
}
function approximationScene(n=100,total=1000){
  return `<div class="approximation-settings"><span>People per sample: <select data-approx-size aria-label="People per sample">${[25,100,400].map(v=>`<option value="${v}" ${v===n?'selected':''}>${v}</option>`).join('')}</select></span><span data-approx-count>${total.toLocaleString('en')}${total<1000?' / 1,000':''} repeated samples</span><button data-approx-replay>Repeat experiment</button></div><div data-approx-host>${approximationPlot(n,total)}</div><p class="small center">Standard error: ${(100*Math.sqrt(P*(1-P)/n)).toFixed(0)} percentage points</p>`;
}
function approximationCaption(n){return n===25?'25 people per sample: a visibly discrete distribution.':n===100?'Larger samples give a finer range of possible estimates.':'The distribution concentrates around p; the normal approximation improves.';}
function probabilityPicture(k){
  const opts=k===3?{lo:-5,hi:5,areaLabel:'Total area = 100%'}:k===4?{lo:-5,hi:0,areaLabel:'50%',bounds:true}:k===5?{lo:-.6744897502,hi:.6744897502,areaLabel:'50%',bounds:true}:k===6?{lo:-1,hi:1,areaLabel:'≈ 68%',bounds:true}:{lo:-2,hi:2,areaLabel:'≈ 95%',bounds:true};
  let b=bell(opts);
  if(k===5){const l=NX(-.6744897502),r=NX(.6744897502);b=b.replace('</svg>',`<rect x="${l}" y="294" width="${r-l}" height="26" fill="white" stroke="${C.teal}" stroke-width="3"/>${line(NX(0),294,NX(0),320,C.ink,3)}${txt(1080,42,'Boxplot recall: the middle half',25,C.teal,'end')}</svg>`);}
  return b;
}

function linkedCoveragePlot({n=100,level=95,total=1000,phase=2,windowStart=0}={}){
  const {items}=coverageSummary(n,level,total),min=n===25?-.2:0,domain=n===25?.6:.4,span=domain-min,X=x=>100+(x-min)/span*960,T=68,B=319;
  const histogramView=phase===0,bands=phase===2,micro=total<=4;
  const counts=Array(61).fill(0);items.forEach(d=>counts[Math.min(60,Math.round(d.estimate*100))]++);
  const Y=d=>B-d/42*224;
  let b=line(X(P),48,X(P),B,C.rose,2,'stroke-dasharray="5 5"')+txt(X(P),34,'True prevalence: 20%',25,C.rose,'middle');
  if(histogramView){
    counts.forEach((c,i)=>{if(c){const l=Math.max(min,(i-.5)/100),r=Math.min(domain,(i+.5)/100);b+=`<rect data-coverage-bin x="${X(l)}" y="${Y(c/1000/.01)}" width="${X(r)-X(l)-.6}" height="${B-Y(c/1000/.01)}" fill="${C.teal}" opacity=".24"/>`;}});
    if(total===1000)b+=`<path data-coverage-normal d="${pathCurve(X,Y,min,domain,P,Math.sqrt(P*(1-P)/n))}" fill="none" stroke="${C.rose}" stroke-width="3"/>`;
  }
  const first=Math.max(0,Math.min(windowStart,Math.max(0,total-50))),last=Math.min(total,first+50),stacks={};
  items.slice(first,last).forEach((d,j)=>{
    const i=first+j,bin=Math.round(d.estimate*100),rank=stacks[bin]||0;stacks[bin]=rank+1;
    const x=X(d.estimate),y=histogramView?B-5-rank*7:micro?96+j*59:T+j*244/Math.max(4,Math.min(total,50)-1),col=bands?(d.covers?C.teal:C.rose):C.teal;
    const xlo=X(Math.max(min,d.lo)),xhi=X(Math.min(domain,d.hi));
    b+=`<g data-key="coverage-${i}" data-interval="${i}" data-covers="${d.covers}" data-estimate="${d.estimate}" style="transform:translate(${x}px,${y}px)">`;
    if(bands){
      b+=`<line data-whisker x1="${xlo-x}" x2="${xhi-x}" y1="0" y2="0" stroke="${col}" stroke-width="${micro?4:2}" ${d.covers?'':'stroke-dasharray="5 4"'}/>`;
      if(d.lo<min)b+=`<path data-clipped-end d="M${xlo-x+6},-4L${xlo-x},0L${xlo-x+6},4" fill="none" stroke="${col}" stroke-width="2"/>`;
      if(d.hi>domain)b+=`<path data-clipped-end d="M${xhi-x-6},-4L${xhi-x},0L${xhi-x-6},4" fill="none" stroke="${col}" stroke-width="2"/>`;
    }
    b+=`<circle r="${micro?6:3}" fill="${col}"/></g>`;
    if(micro)b+=txt(85,y+7,String(i+1),22,C.muted,'end')+txt(x,y+29,`${pct(d.estimate)}${bands?'  ['+pct(d.lo)+', '+pct(d.hi)+']':''}`,21,col,'middle');
  });
  b+=line(X(min),B+10,X(domain),B+10);for(let i=0;i<=4;i++){const x=min+i*span/4;b+=txt(X(x),B+41,pct(x),24,C.ink,'middle');}
  b+=txt(1060,397,bands?'Estimate and confidence interval':'Estimated prevalence',25,C.ink,'end');
  return svg(b,1152,414,'The same simulated estimates on an axis symmetric around true prevalence, 20 percent. Arrowheads indicate interval ends beyond the displayed range.').replace('class="chart"',`class="chart" data-coverage-min="${min}" data-coverage-max="${domain}"`);
}
function linkedCoverageScene(config){
  const {n,level,total,phase,windowStart=0}=config,s=coverageSummary(n,level,total),first=Math.min(windowStart,Math.max(0,total-50));
  const explanation=phase===0?`The same estimates form the histogram; ${Math.min(total,50)} points are highlighted.`:total<=4?'Keep the estimates; temporarily hide their intervals.':'Spread the same points into rows. Their estimates stay unchanged.';
  const caution=total<4?'Each new sample gives a new estimate and interval.':total===4?'Four samples do not determine the long-run coverage rate.':'Solid intervals contain 20%; dashed intervals miss it.<br>'+(n===25?'Small samples: approximate coverage. Arrows mark clipped interval ends.':'Approximate coverage under the model; simulation also fluctuates.');
  return `<div class="coverage-settings"><span>Sample size <select data-coverage-n aria-label="Sample size">${[25,100,400,1600].map(v=>`<option value="${v}" ${v===n?'selected':''}>${v}</option>`).join('')}</select></span><span>Nominal confidence <select data-coverage-level aria-label="Confidence level">${[80,95,99].map(v=>`<option value="${v}" ${v===level?'selected':''}>${v}%</option>`).join('')}</select></span></div><div data-linked-plot>${linkedCoveragePlot(config)}</div><div class="coverage-readout" data-linked-readout>${phase===2?`${s.hits} / ${total.toLocaleString('en')} intervals contain 20%${total?' ('+(100*s.hits/total).toFixed(1)+'%)':''}`:explanation}</div><div class="coverage-controls"><button data-linked-action="animate">Draw more samples</button><button data-linked-action="all">Show 1,000</button><button data-linked-action="window" ${total<=50||phase!==2?'disabled':''}>Next 50 rows</button><span data-linked-detail>${total>50?`Rows ${first+1}–${Math.min(first+50,total)} shown; ${total.toLocaleString('en')} counted`:'Same seeded samples as before'}</span></div><p class="coverage-foot" data-linked-foot>${phase===2?caution:'Every point represents one sample. The true prevalence stays at 20%.'}</p>`;
}
function jamaDifference(){
  const X=x=>335+(x+5)/25*750,rows=[['24 h (primary)',4.7,-1.8,11.2],['48 h (secondary)',8.7,1.2,16.2]];
  let b=txt(1080,33,'Difference in recovery (percentage points)',27,C.ink,'end')+line(X(0),60,X(0),284,C.muted,2,'stroke-dasharray="5 5"');
  rows.forEach(([name,est,lo,hi],i)=>{const y=107+i*119;b+=txt(15,y+8,name,28)+(i?txt(15,y+40,'Exploratory',22,C.muted):'')+line(X(lo),y,X(hi),y,C.rose,5)+`<circle cx="${X(est)}" cy="${y}" r="8" fill="${C.teal}"/>`+txt(X(est),y+41,`${est.toFixed(1)} [${lo.toFixed(1)}, ${hi.toFixed(1)}]`,25,C.rose,'middle');});
  b+=line(X(-5),292,X(20),292);for(const x of [-5,0,5,10,15,20])b+=txt(X(x),326,x,23,C.ink,'middle');
  b+=txt(X(0),367,'0 = no difference',24,C.muted,'middle');
  return svg(b,1152,395,'Adjusted differences in recovery, dexamethasone minus placebo, with 95 percent confidence intervals transcribed from JAMA Figure 2.');
}

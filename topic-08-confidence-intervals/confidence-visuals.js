 
const Z95=1.959963984540054;
const SE=Math.sqrt(P*(1-P)/100);
const ci=(estimate,n=100,z=Z95)=>{
  const se=Math.sqrt(estimate*(1-estimate)/n);
  return {estimate,se,lo:estimate-z*se,hi:estimate+z*se};
};
const intervals=draws.map(d=>({...ci(d.estimate),covers:ci(d.estimate).lo<=P&&ci(d.estimate).hi>=P}));
const coverage=intervals.filter(d=>d.covers).length;
const showIf=(ok)=>ok?'show':'reveal';

function populationSample(k){
  let b=txt(40,35,'Population',31)+txt(40,72,'True prevalence: 20%',25,C.rose);
  const population=Array.from({length:300},(_,i)=>i<60?1:0),random=rng(672); for(let i=population.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[population[i],population[j]]=[population[j],population[i]];}
  const used=new Set(),origins=[];
  for(const v of draws[0].data){const pool=population.map((a,i)=>a===v&&!used.has(i)?i:-1).filter(i=>i>=0),j=pool[Math.floor(random()*pool.length)];used.add(j);origins.push(j);}
  population.forEach((v,i)=>{b+=`<circle cx="${50+i%20*18}" cy="${105+Math.floor(i/20)*18}" r="5.4" fill="${v?C.teal:C.pale}" opacity="${k&&used.has(i)?.25:1}"/>`;});
  b+=txt(40,413,'Schematic of a large population',22,C.muted);
  if(k>=1){
    b+=arrow(440,225,625,225)+txt(535,85,'Random sample',24,C.teal,'middle');
    b+=txt(695,35,'Sample: 100 adults',31);
    draws[0].data.forEach((v,i)=>{const j=origins[i];b+=`<g data-key="medical-${i}" data-origin="${50+j%20*18},${105+Math.floor(j/20)*18}" style="transform:translate(${710+i%10*34}px,${110+Math.floor(i/10)*26}px)"><circle r="8" fill="${v?C.teal:C.pale}"/>${v?'<circle r="2" fill="white"/>':''}</g>`;});
    b+=txt(695,405,'18 cases among 100 observations',26,C.teal);
  }
  b+=`<circle cx="45" cy="445" r="6" fill="${C.teal}"/><circle cx="235" cy="445" r="6" fill="${C.pale}"/>`+txt(60,452,'With disease',22,C.teal)+txt(250,452,'Without disease',22,C.muted);
  return svg(b,1152,465,'A schematic population with prevalence 20 percent and an independent sample of 100 adults containing 18 cases');
}

function histogram(total=0,normal=false){
  const L=110,R=1095,T=40,B=245,X=x=>L+x/.4*(R-L),Y=y=>B-y/130*(B-T);
  const counts=Array(101).fill(0);draws.slice(0,total).forEach(d=>counts[d.cases]++);
  let b='';
  for(const y of [0,50,100])b+=line(L,Y(y),R,Y(y),'#e4ebec',1)+txt(L-15,Y(y)+7,y,22,C.ink,'end');
  b+=txt(29,157,'Samples in each bin',22,C.ink,'middle','transform="rotate(-90 29 157)"');
  b+=line(L,B,R,B);
  for(let v=0;v<=.4001;v+=.05)b+=line(X(v),B,X(v),B+7)+txt(X(v),B+31,pct(v),23,C.ink,'middle');
  b+=txt(R,303,'Estimated prevalence',25,C.ink,'end');
  for(let i=0;i<=40;i++){const left=Math.max(0,(i-.5)/100),right=(i+.5)/100;b+=`<rect data-bin="${i}" x="${X(left)+.7}" y="${Y(counts[i])}" width="${X(right)-X(left)-1.4}" height="${B-Y(counts[i])}" fill="${C.teal}" opacity=".75"/>`;}
  if(normal)b+=`<path data-normal d="${pathCurve(X,Y,0,.4,P,SE,10)}" fill="none" stroke="${C.rose}" stroke-width="3.5"/>`;
  b+=line(X(P),T,X(P),B,C.rose,2,'stroke-dasharray="5 5"')+txt(X(P),25,'True prevalence: 20%',25,C.rose,'middle');
  
  if(total>0&&total<=12){const d=draws[total-1],c=counts[d.cases];b+=txt(865,62,'Latest bin: '+pct(d.estimate),23,C.teal,'middle')+txt(865,91,`${c} estimate${c===1?'':'s'} (detail)`,22,C.muted,'middle');for(let j=0;j<c;j++)b+=`<rect x="${846+j%6*9}" y="${107+Math.floor(j/6)*10}" width="7" height="8" fill="${C.teal}"/>`;}
  b+='<circle data-flight r="10" fill="'+C.rose+'" opacity="0"/>';
  b+=txt(0,0,'+1',29,C.rose,'middle','data-increment opacity="0"');
  return `<svg class="chart sim-chart" viewBox="0 0 1152 310" role="img" aria-label="Histogram of sample proportions, fixed axes from 0 to 40 percent and 0 to 130 samples per bin">${b}</svg>`;
}
function histogramScene(total,normal){
  const d=draws[Math.max(0,total-1)];
  return `<div class="sim-top"><div><p class="small" style="margin:0">Latest sample: 100 people</p><div data-sim-dots>${dots(d.data,340,88,20)}</div></div><div class="sim-readout" data-sim-readout>Sample ${total||1}<br><span class="teal">${d.cases} / 100 = ${pct(d.estimate)}</span></div><div class="sim-context">Same population<br><span class="rose">p = 20%</span></div></div><div data-sim-plot>${histogram(total,normal)}</div><div class="sim-controls"><button data-action="one">One sample</button><button data-action="run">Animate to 1,000</button><button data-action="finish">Show all 1,000</button><span data-sim-count>${total.toLocaleString('en')} / 1,000 samples</span></div><p class="bottomline" data-sim-caption>${normal?'The red curve approximates the distribution of estimates.':'Each independent sample contributes one estimate to the histogram.'}</p>`;
}

const normalGeometry={L:100,R:1080,T:48,B:320};
const NX=z=>100+(z+5)/10*980;
const NY=z=>320-density(z,0,1)/.43*272;
function areaPath(lo,hi){const points=Array.from({length:181},(_,i)=>lo+(hi-lo)*i/180);return `M${NX(lo)},320 ${points.map(z=>`L${NX(z)},${NY(z)}`).join(' ')} L${NX(hi)},320Z`;}
function bell({lo=null,hi=null,scale='prevalence',areaLabel='',bounds=false,tails=false,quantile=false,hist=false}={}){
  let b='';
  if(hist){const counts=Array(101).fill(0);draws.forEach(d=>counts[d.cases]++);for(let c=0;c<=40;c++){const z=(c/100-P)/SE,left=(c/100-.005-P)/SE,right=(c/100+.005-P)/SE,h=counts[c]/1000/.01*SE/.43*272;b+=`<rect x="${NX(left)}" y="${320-h}" width="${NX(right)-NX(left)}" height="${h}" fill="${C.teal}" opacity=".3"/>`;}}
  if(lo!==null&&hi!==null)b+=`<path data-normal-area data-lo="${lo}" data-hi="${hi}" d="${areaPath(lo,hi)}" fill="${C.teal}" opacity=".2"/>`;
  if(tails){b+=`<path d="${areaPath(-5,lo)}" fill="${C.rose}" opacity=".16"/><path d="${areaPath(hi,5)}" fill="${C.rose}" opacity=".16"/>`;}
  b+=`<path data-bell d="${pathCurve(NX,z=>320-z/.43*272,-5,5,0,1)}" fill="none" stroke="${C.rose}" stroke-width="4"/>`+line(100,320,1080,320);
  const ticks=scale==='prevalence'?[-5,-2.5,0,2.5,5]:[-4,-3,-2,-1,0,1,2,3,4];
  for(const z of ticks){const label=scale==='prevalence'?pct(P+SE*z):scale==='error'?Math.round(SE*z*100):z;b+=line(NX(z),320,NX(z),327)+txt(NX(z),354,label,24,C.ink,'middle');}
  b+=line(NX(0),48,NX(0),320,C.line,2,'stroke-dasharray="5 5"');
  const axis=scale==='prevalence'?'Estimated prevalence':scale==='error'?'Estimation error (percentage points)':hist?'Standardised estimate':'Standard normal value';
  b+=txt(1080,416,axis,25,C.ink,'end');
  if(bounds){for(const [j,z] of [lo,hi].entries())if(z>-5&&z<5){b+=line(NX(z),NY(z),NX(z),320,C.teal,2,`data-area-bound="${j}"`);if(Math.abs(z)>0.01)b+=txt(NX(z),386,scale==='prevalence'?pct(P+SE*z):Number(z.toFixed(Math.abs(z)>1.6&&Math.abs(z)<1.7?3:2)),24,C.teal,'middle','data-area-label');}}
  if(areaLabel)b+=txt(NX(quantile?-0.5:(lo===-5&&hi!==5?-.75:0)),(lo===-5&&!quantile?(hi===5?270:255):210),areaLabel,35,C.teal,'middle','data-area-label');
  if(tails)b+=txt(NX(-3.2),287,'2.5%',23,C.rose,'middle')+txt(NX(3.2),287,'2.5%',23,C.rose,'middle');
  return svg(b,1152,433,`Normal approximation with ${scale==='prevalence'?'mean 20 percent and standard error 4 percentage points':'standardised centre 0 and standard deviation 1'}, ${areaLabel||'density curve'}`);
}

function intervalLine(d,{truth=false,label=true}={}){
  const X=x=>110+x/.4*950;let b=line(X(0),160,X(.4),160);
  for(const x of [0,.1,.2,.3,.4])b+=line(X(x),160,X(x),168)+txt(X(x),198,pct(x),24,C.ink,'middle');
  b+=line(X(d.lo),90,X(d.hi),90,C.teal,5,'data-ci-whisker')+line(X(d.lo),78,X(d.lo),102,C.teal,3,'data-ci-cap')+line(X(d.hi),78,X(d.hi),102,C.teal,3,'data-ci-cap')+`<circle data-ci-point cx="${X(d.estimate)}" cy="90" r="9" fill="${C.teal}"/>`;
  if(label)b+=txt(X(d.lo),55,pct(d.lo),27,C.teal,'middle','data-ci-end-label')+txt(X(d.hi),55,pct(d.hi),27,C.teal,'middle','data-ci-end-label')+txt(X(d.estimate),132,pct(d.estimate),27,C.ink,'middle');
  if(truth)b+=line(X(P),15,X(P),165,C.rose,2,'stroke-dasharray="5 5"')+txt(X(P),237,'True prevalence: 20%',24,C.rose,'middle');
  return svg(b,1152,255,'Estimated prevalence with its approximate confidence interval');
}
function coveragePlot(total=50){
  const X=x=>150+x/.45*940,T=55,B=405;
  const visible=intervals.slice(0,Math.min(total,50));let b=txt(25,27,'Sample',23,C.muted)+txt(X(P),27,'Fixed true prevalence: 20%',26,C.rose,'middle');
  b+=line(X(P),42,X(P),B+8,C.rose,2,'stroke-dasharray="5 5"');
  visible.forEach((d,i)=>{const y=T+i*7,col=d.covers?C.teal:C.rose;b+=`<g data-interval="${i}" data-covers="${d.covers}">${line(X(d.lo),y,X(d.hi),y,col,2,d.covers?'':'stroke-dasharray="5 3"')}<circle cx="${X(d.estimate)}" cy="${y}" r="2.8" fill="${col}"/></g>`;if([0,9,24,49].includes(i))b+=txt(73,y+6,i+1,20,C.muted,'end');});
  b+=line(X(0),B+15,X(.45),B+15);
  for(const x of [0,.1,.2,.3,.4])b+=txt(X(x),B+46,pct(x),23,C.ink,'middle');
  return svg(b,1152,460,'The first 50 confidence intervals from independent samples, with missed intervals dashed in rose and the true prevalence fixed at 20 percent');
}
function coverageScene(total=0){const actual=total>=1000?1000:Math.min(total,50),covered=intervals.slice(0,actual).filter(d=>d.covers).length;return `<p class="lead">Repeat the sampling, and calculate a new interval each time.</p><div data-coverage-plot>${coveragePlot(total)}</div><div class="coverage-bottom"><button data-coverage-action="run">Animate 50 intervals</button><button data-coverage-action="finish">Show 1,000 results</button><span data-coverage-count>${actual?`${covered} / ${actual} contain p${actual===1000?' ('+(coverage/10).toFixed(1)+'%)':''}`:'Same method for every sample'}</span></div><p class="small muted" style="margin-top:10px">${total>=1000?'First 50 shown; 1,000 counted. Finite-sample coverage is approximate.':'Solid teal: contains p. Dashed rose: misses p.'}</p>`;}

function confidenceComparison(k){const specs=[{level:'90%',z:1.6448536269514722},{level:'95%',z:Z95},{level:'99%',z:2.5758293035489004}];const X=x=>220+x/.4*850;let b='';specs.slice(0,k+1).forEach((s,i)=>{const d=ci(.18,100,s.z),y=66+i*108;b+=txt(50,y+8,s.level,34,i===1?C.rose:C.ink)+line(X(d.lo),y,X(d.hi),y,C.teal,5)+`<circle cx="${X(.18)}" cy="${y}" r="8" fill="${C.teal}"/>`+txt(X(d.lo),y+38,pct(d.lo),23,C.muted,'middle')+txt(X(d.hi),y+38,pct(d.hi),23,C.muted,'middle');});b+=line(X(0),354,X(.4),354);for(const x of [0,.1,.2,.3,.4])b+=txt(X(x),387,pct(x),23,C.ink,'middle');return svg(b,1152,410,'Confidence intervals at 90, 95 and 99 percent confidence for the same observed 18 percent prevalence');}

function precisionPanel(n){const d=ci(.2,n);return `<div><p class="medium">n = ${n}</p><p class="big teal">± ${(100*Z95*Math.sqrt(.16/n)).toFixed(1)} points</p><p class="small">Approximate 95% margin of error<br>when the estimate is 20%</p></div>`;}
function jamaComparison(){const X=x=>285+(x-.7)/1.2*750,rows=[['24 h (primary)',1.28,.92,1.78],['48 h (secondary)',1.31,1.02,1.68]];let b=txt(1080,33,'Risk ratio (95% CI)',28,C.ink,'end');b+=line(X(1),55,X(1),287,C.muted,2,'stroke-dasharray="5 5"');rows.forEach(([name,est,lo,hi],i)=>{const y=104+i*123;b+=txt(15,y+8,name,28)+(i?txt(15,y+43,'Exploratory',22,C.muted):'')+line(X(lo),y,X(hi),y,C.teal,4)+`<circle cx="${X(est)}" cy="${y}" r="8" fill="${C.teal}"/>`+txt(X(est),y+43,`${est.toFixed(2)} [${lo.toFixed(2)}, ${hi.toFixed(2)}]`,26,C.teal,'middle');});b+=line(X(.7),299,X(1.9),299);for(const x of [.75,1,1.25,1.5,1.75])b+=txt(X(x),337,x.toFixed(2),23,C.ink,'middle');b+=txt(X(1),380,'1 = no difference',25,C.muted,'middle');return svg(b,1152,405,'Selected Overall adjusted risk ratios and confidence intervals from JAMA figure 2, on a linear risk ratio scale');}

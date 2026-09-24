 
function densityPath(X,Y,lo,hi,mean,sd){return Array.from({length:221},(_,i)=>{const p=lo+(hi-lo)*i/220;return `${i?'L':'M'}${X(p).toFixed(3)},${Y(normalPDF((p-mean)/sd)/sd).toFixed(3)}`;}).join(' ');}
function densityArea(X,Y,base,lo,hi,mean,sd){return `M${X(lo).toFixed(3)},${base} ${densityPath(X,Y,lo,hi,mean,sd).replace(/^M/,'L')} L${X(hi).toFixed(3)},${base} Z`;}
const areaPath=(d,color,key,opacity=.27)=>`<path data-morph="${key}" d="${d}" fill="${color}" opacity="${opacity}"/>`;
const curvePath=(d,color,key)=>`<path data-morph="${key}" d="${d}" fill="none" stroke="${color}" stroke-width="3"/>`;
function proportionFigure({alpha=.05,markers=[],regions=false,pvalue=false,mode='two',zAxis=false}={}){
 const L=90,R=1060,B=276,X=p=>L+(p-.04)/.32*(R-L),Y=d=>B-19*d,sd=.04;
 const q=mode==='two'?zcrit(alpha):normalQuantile(1-alpha),lo=.2-q*sd,hi=.2+q*sd;
 const left=mode!=='right',right=mode!=='left';let b='';
 const ranges=[];if(left)ranges.push([.04,lo,'left']);if(right)ranges.push([hi,.36,'right']);
 if(regions&&!pvalue){
  const cl=left?lo:.04,ch=right?hi:.36;
  b+=areaPath(densityArea(X,Y,B,cl,ch,.2,sd),C.pale,'central',1);
  ranges.forEach(([a,c,id])=>b+=areaPath(densityArea(X,Y,B,a,c,.2,sd),C.rose,'reject-'+id,.3));
  b+=txt(X(.2),145,pct(1-alpha),30,C.ink,'middle');
  const tailLabel=pct(mode==='two'?alpha/2:alpha,1).replace('.0%','%');
  if(left)b+=txt(X(.072),120,tailLabel,27,C.rose,'middle');
  if(right)b+=txt(X(.328),120,tailLabel,27,C.rose,'middle');
 }
 if(pvalue&&markers.length){const obs=markers[0]/100,dist=Math.abs(obs-.2);let a;
  if(mode==='two')a=[[.04,.2-dist],[.2+dist,.36]];else a=mode==='right'?[[obs,.36]]:[[.04,obs]];
  a.forEach(([l,h],i)=>b+=areaPath(densityArea(X,Y,B,Math.max(.04,l),Math.min(.36,h),.2,sd),C.teal,'p-area-'+i,.27));
  b+=txt(575,27,'Shaded area: p-value',24,C.teal,'middle');
 }
 b+=curvePath(densityPath(X,Y,.04,.36,.2,sd),C.ink,'null-curve')+line(L,B,R,B);
 if(regions){
  for(const [a,c,id] of ranges)b+=`<rect data-morph="rule-strip-${id}" x="${X(a)}" y="${B+3}" width="${X(c)-X(a)}" height="5" fill="${C.rose}"/>`;
  for(const [p,id] of [[lo,'low'],[hi,'high']]){if((id==='low'&&!left)||(id==='high'&&!right))continue;
   b+=`<g data-key="cut-${id}" style="transform:translate(${X(p)}px,0px)">`+line(0,65,0,B,C.rose,1.8,'stroke-dasharray="5 5"')+txt(0,B+38,pct(p,1),23,C.rose,'middle')+'</g>';
  }
 }
 for(const p of [.08,.12,.16,.2,.24,.28,.32]){if(regions&&((left&&Math.abs(p-lo)<.022)||(right&&Math.abs(p-hi)<.022)))continue;b+=line(X(p),B,X(p),B+8)+txt(X(p),B+38,pct(p),24,C.ink,'middle');}
 markers.forEach((k,i)=>{const p=k/100,rej=mode==='two'?(p<lo||p>hi):mode==='right'?p>hi:p<lo,col=regions&&rej&&!pvalue?C.rose:C.teal;
  b+=`<g data-key="sample-${markers.length===1?'observed':k}" data-cases="${k}" style="transform:translate(${X(p)}px,0px)">`+line(0,markers.length===3&&i===1?88:53,0,B,col,2.5)+`<circle cy="${B}" r="7" fill="${col}"/>`+txt(p<.2?-13:13,markers.length===3&&i===1?79:44,`${k}%`,27,col,p<.2?'end':'start')+'</g>';
 });
 if(zAxis){b+=txt(L,362,'z-score',21,C.muted);for(const p of [.12,.16,.2,.24,.28])b+=txt(X(p),362,((p-.2)/.04).toFixed(0),22,C.muted,'middle');}
 else b+=txt(R,365,'Observed sample proportion',23,C.muted,'end');
 return svg(b,1152,382,'Normal sampling distribution under a population prevalence of 20 percent, sample size 100, with critical limits and observed sample proportions');
}
function matchingIntervals(alpha=.05){
 const rows=[18,25,30].map(k=>({...sampleStats(k,100,.2,alpha),name:`${k} / 100`}));
 const X=p=>260+p/.5*780;let b=txt(1040,27,`${pct(1-alpha)} confidence intervals`,25,C.ink,'end')+line(X(.2),43,X(.2),316,C.muted,2,'stroke-dasharray="5 5"');
 rows.forEach((d,i)=>{const y=84+i*90,col=d.reject?C.rose:C.teal;b+=txt(0,y+8,d.name,27)+`<g data-key="ci-${d.k}" style="transform:translate(${X(d.est)}px,${y}px)">`+`<path data-morph="ci-line-${d.k}" d="M${X(d.lo)-X(d.est)},0 L${X(d.hi)-X(d.est)},0" stroke="${col}" stroke-width="4"/>`+`<circle r="7" fill="${col}"/></g>`+txt(1130,y+8,d.reject?'Reject':'Do not reject',23,col,'end')+txt(X(d.est),y+35,`[${pct(d.lo,1)}, ${pct(d.hi,1)}]`,22,col,'middle');});
 b+=line(X(0),323,X(.5),323);for(const p of [0,.1,.2,.3,.4,.5])b+=txt(X(p),359,pct(p),23,C.ink,'middle');
 return svg(b,1152,382,'Confidence intervals obtained by inverting the same test, compared with the null prevalence of 20 percent');
}
function medicalTable(k=3){
 return `<table class="table matrix medical-matrix"><thead><tr><th>Decision / Reality</th><th>H₀ is true<br><span class="small">The drug has no effect</span></th><th>H₀ is false<br><span class="small">The drug has an effect</span></th></tr></thead><tbody><tr><th>Reject H₀</th><td class="${k>=1?'mistake':''}">${k>=1?'Type I error<br><span class="small">Falsely declaring an effect</span>':''}</td><td>${k>=2?'Correct detection':''}</td></tr><tr><th>Do not reject H₀</th><td>${k>=1?'Correct non-rejection':''}</td><td class="${k>=2?'mistake':''}">${k>=2?'Type II error<br><span class="small">Missing a real effect</span>':''}</td></tr></tbody></table>`;
}
function powerFigure({n=100,p1=.3,alpha=.05,stage=3}={}){
 const q=normalPower(p1,n,alpha),L=78,R=846,X=p=>L+p/.55*(R-L),A=6,B0=168,B1=350,Y0=d=>B0-A*d,Y1=d=>B1-A*d;
 const clamp=p=>Math.max(0,Math.min(.55,p));let b='';
 b+=txt(L,29,'If the true prevalence is 20%',25,C.ink);
 b+=areaPath(densityArea(X,Y0,B0,0,clamp(q.lo),.2,q.se0),C.rose,'null-left')+areaPath(densityArea(X,Y0,B0,clamp(q.hi),.55,.2,q.se0),C.rose,'null-right');
 b+=curvePath(densityPath(X,Y0,0,.55,.2,q.se0),C.ink,'power-null')+line(L,B0,R,B0);
 b+=txt(891,77,'Type I error',25,C.rose)+txt(891,115,`α = ${pct(alpha)}`,30,C.rose);
 if(stage>=1){
  b+=txt(L,211,`If the true prevalence is ${pct(p1)}`,25,C.ink);
  if(stage>=2)b+=areaPath(densityArea(X,Y1,B1,clamp(q.lo),clamp(q.hi),p1,q.se1),C.rose,'beta-area',.3);
  if(stage>=3)b+=areaPath(densityArea(X,Y1,B1,0,clamp(q.lo),p1,q.se1),C.teal,'power-left',.45)+areaPath(densityArea(X,Y1,B1,clamp(q.hi),.55,p1,q.se1),C.teal,'power-right',.45);
  b+=curvePath(densityPath(X,Y1,0,.55,p1,q.se1),C.teal,'power-alt')+line(L,B1,R,B1);
  if(stage>=2)b+=txt(891,253,'Missed detection',23,C.rose)+txt(891,289,`β ≈ ${pct(q.beta,1)}`,29,C.rose);
  if(stage>=3)b+=txt(891,335,'Power',25,C.teal)+txt(891,371,pct(q.power,1),35,C.teal);
 }
 for(const [p,id] of [[q.lo,'low'],[q.hi,'high']])b+=`<g data-key="power-cut-${id}" style="transform:translate(${X(p)}px,0px)">`+line(0,48,0,stage?B1:B0,C.muted,1.6,'stroke-dasharray="5 5"')+'</g>';
 b+=line(L,385,R,385);for(const p of [0,.1,.2,.3,.4,.5])b+=txt(X(p),415,pct(p),23,C.ink,'middle');
 b+=txt(R,444,'Observed sample proportion',22,C.muted,'end');
 return svg(b,1152,456,'Sampling distributions under null and specified alternative, with Type I error, Type II error and power areas');
}
function powerHost(config,print=false,control='n'){
 const settings=`<p class="power-settings">${math(tex`H_0:p=20\%`)}<span data-sample-size>${config.n} people per study</span><span>Significance level: ${pct(config.alpha??.05)}</span></p>`;
 const controls=print?'':control==='n'?`<label class="live-control">People per study <input data-n-slider type="range" min="50" max="400" step="1" value="${config.n}" aria-label="People per study"><output>${config.n}</output></label>`:'';
 return `<div data-power-host data-config='${JSON.stringify(config)}' data-control="${control}">${settings}<div data-power-figure>${powerFigure(config)}</div>${controls}</div>`;
}

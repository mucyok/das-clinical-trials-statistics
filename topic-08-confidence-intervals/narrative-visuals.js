 
const mix=(a,b,t)=>a+(b-a)*t;
const clamp=t=>Math.max(0,Math.min(1,t));
function empiricalWindow(total=1000,lo=.16,hi=.24){
  const data=draws.slice(0,total),hits=data.filter(d=>d.estimate>=lo-1e-10&&d.estimate<=hi+1e-10).length;
  return {total,hits,fraction:total?hits/total:0,lo,hi};
}
function countedHistogram(total=1000,range=null){
  const X=x=>100+x/.4*970,B=275,Y=c=>B-c/130*208;
  const counts=Array(101).fill(0);draws.slice(0,total).forEach(d=>counts[d.cases]++);
  let b=txt(100,30,'n = 100 people per sample',27)+txt(1070,30,`${total.toLocaleString('en')} estimates`,27,C.ink,'end');
  if(range)b+=`<rect x="${X(range[0]-.005)}" y="58" width="${X(range[1]+.005)-X(range[0]-.005)}" height="217" fill="${C.teal}" opacity=".055"/>`;
  for(const v of [0,50,100])b+=line(100,Y(v),1070,Y(v),'#e4ebec',1)+txt(83,Y(v)+7,v,21,C.muted,'end');
  counts.slice(0,41).forEach((c,i)=>{
    const hit=range&&i/100>=range[0]-1e-10&&i/100<=range[1]+1e-10;
    b+=`<rect data-count-bin="${i}" data-count="${c}" data-in-window="${!!hit}" x="${X(Math.max(0,(i-.5)/100))+.6}" y="${Y(c)}" width="${970/.4*.01-1.2}" height="${B-Y(c)}" fill="${C.teal}" opacity="${!range||hit?.8:.18}"/>`;
  });
  b+=line(100,B,1070,B)+line(X(P),56,X(P),B,C.rose,2,'stroke-dasharray="5 5"')+txt(X(P),53,'p = 20%',24,C.rose,'middle');
  for(const v of [0,.1,.2,.3,.4])b+=txt(X(v),309,pct(v),24,C.ink,'middle');
  b+=txt(1070,343,'Estimated prevalence',24,C.ink,'end');
  if(range){for(const x of range)b+=line(X(x),B+4,X(x),B+13,C.teal,2);}
  if(total<=5){b+=txt(770,98,'One estimate per sample',24,C.muted,'middle');draws.slice(0,total).forEach((d,i)=>b+=txt(700+i*74,138,pct(d.estimate),25,C.teal,'middle'));}
  return svg(b,1152,355,'Histogram of estimates, each from 100 observations. The population prevalence is fixed at 20 percent.');
}
function histogramReading(k,total=k?1000:3){
  const range=k>=3?[.12,.28]:k>=2?[.16,.24]:null,summary=range?empiricalWindow(total,...range):null;
  return `<p class="medium">Keep one estimate from each new sample.</p><div data-counted-plot>${countedHistogram(total,range)}</div><p class="empirical-readout" data-counted-readout>${summary?`${summary.hits} / ${total.toLocaleString('en')} estimates between ${pct(range[0])} and ${pct(range[1])} (${(100*summary.fraction).toFixed(1)}%)`:`${total.toLocaleString('en')} samples, ${total.toLocaleString('en')} estimates`}</p><div class="story-controls"><button data-story-run>${total>=1000?'Replay sampling':'Continue sampling'}</button><button data-story-all>Show 1,000</button></div><p class="bottomline">${range?'A wider range around 20% contains more of the estimates.':'The population stays fixed. The estimate changes with the sample.'}</p>`;
}
function sizeRow(n,normal=true){
  const data=ensemble(n),sd=Math.sqrt(.16/n),L=110,R=715,T=15,B=101,X=x=>L+x/.4*(R-L),Y=d=>B-d/26*(B-T),width=1/n;
  const counts=Array(n+1).fill(0);data.forEach(d=>counts[d.cases]++);
  let b=txt(0,54,`n = ${n}`,27);
  
  counts.forEach((c,k)=>{const x=k/n;if(!c||x>.4)return;const a=Math.max(0,x-width/2),z=Math.min(.4,x+width/2),actualWidth=z-a,d=c/1000/actualWidth,height=d/26*(B-T);b+=`<rect data-size-bin="${n}-${k}" data-density="${d}" data-bin-width="${actualWidth}" data-count="${c}" x="${X(a)}" y="${B-height}" width="${X(z)-X(a)}" height="${height}" fill="${C.teal}" opacity=".3"/>`;});
  if(normal)b+=`<path data-size-normal="${n}" d="${pathCurve(X,Y,0,.4,P,sd)}" fill="none" stroke="${C.rose}" stroke-width="3"/>`;
  b+=line(L,B,R,B)+line(X(P),T,X(P),B,C.line,1,'stroke-dasharray="4 4"');
  for(const x of [0,.1,.2,.3,.4])b+=txt(X(x),125,pct(x),20,C.ink,'middle');
  const beyond=data.filter(d=>d.estimate>.4).length;
  if(beyond)b+=txt(R,13,`${beyond} estimates above 40% →`,18,C.muted,'end');
  if(normal)b+=`<foreignObject x="770" y="15" width="370" height="65"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:26px;color:${C.rose}">${math(tex`\mathcal N(0.20,\,${sd.toFixed(2)}^{2})`)}</div></foreignObject>`;
  b+=txt(783,95,`SD: ${Math.round(sd*100)} percent points`,25,C.muted);
  return `<svg class="chart size-row" data-size-row="${n}" viewBox="0 0 1152 136" role="img" aria-label="${n} people per sample, 1000 estimates, standard deviation ${sd*100} percent points. ${beyond} estimates beyond the plotted upper boundary.">${b}</svg>`;
}
function sizeComparison(k){
  return `<p class="medium">Same prevalence: 20%. Each row contains 1,000 estimates.</p><div class="size-rows">${[25,100,400].slice(0,Math.min(3,k+1)).map(n=>sizeRow(n,k>=3)).join('')}</div><p class="bottomline">${k<3?'More people per sample: estimates are more concentrated around 20%.':'Rose curves: normal approximations. Their means stay at 20%; their variances shrink.'}</p>`;
}
 
function narrativeGeometry(phase){
  const t=clamp(phase-1),centre=.2*(1-clamp(phase)),sd=.04*Math.pow(25,t);
  return {centre,sd,min:centre-4*sd,max:centre+4*sd,L:85,R:mix(785,1067,t),B:270,H:185,referenceOpacity:1-t};
}
function standardPlot(phase=0,region=false){
  const g=narrativeGeometry(phase),X=z=>mix(g.L,g.R,(z+4)/8),Y=z=>g.B-density(z,0,1)/.43*g.H;
  const path=pathCurve(X,d=>g.B-d/.43*g.H,-4,4,0,1);
  const label=z=>{const v=g.centre+g.sd*z;if(phase<.001)return pct(v);if(phase>1.999)return String(z);return Math.abs(v)<1e-9?'0':v.toFixed(2);};
  let b=normalLegend(85,620,tex`\mathcal N(${Math.abs(g.centre)<1e-9?'0':g.centre.toFixed(2)},\,${g.sd>.999?'1':g.sd.toFixed(2)+'^{2}'})`,C.rose);
  const operation=region?(phase>=2-1e-9?'Start from the standard normal':phase>=1?'Multiply by 0.04':phase>.001?'Add 0.20':'Back to the prevalence scale'):(phase<.001?'Mean 20%, SD 4 percent points':phase<=1?'Subtract 0.20':'Divide by 0.04');
  b+=txt(85,59,operation,24,C.ink);
  if(phase<2-1e-9){
    const iX=z=>mix(866,1114,(z+4)/8),iY=d=>168-d/.43*89;
    b+=`<g data-reference-inset opacity="${g.referenceOpacity}">`+smath(990,13,tex`Z\sim\mathcal N(0,1)`,23,286,60)+`<path d="${pathCurve(iX,iY,-4,4,0,1)}" fill="none" stroke="${C.muted}" stroke-width="2.5" stroke-dasharray="6 5"/>`+line(866,168,1114,168)+[-3,0,3].map(z=>txt(iX(z),195,z,21,C.muted,'middle')).join('')+txt(990,229,'Separate reference axis',19,C.muted,'middle')+'</g>';
  }
  
  if(phase>=2-1e-9)b+=`<path data-shared-reference d="${path}" fill="none" stroke="${C.muted}" stroke-width="7" stroke-dasharray="6 5" opacity=".55"/>`;
  if(region){const lo=-Z95,hi=Z95,pts=Array.from({length:161},(_,i)=>mix(lo,hi,i/160));b+=`<path data-transform-area d="M${X(lo)},270 ${pts.map(z=>`L${X(z)},${Y(z)}`).join(' ')} L${X(hi)},270Z" fill="${C.teal}" opacity=".2"/>`+txt(X(0),215,phase>=1.999?'95%':'≈ 95%',31,C.teal,'middle');}
  b+=`<path data-transform-curve d="${path}" fill="none" stroke="${C.rose}" stroke-width="3.5"/>`+line(g.L,g.B,g.R,g.B)+line(X(0),75,X(0),g.B,C.line,1,'stroke-dasharray="4 4"');
  for(const z of [-3,-2,-1,0,1,2,3])b+=line(X(z),g.B,X(z),g.B+7)+txt(X(z),304,label(z),23,z===0?C.rose:C.ink,'middle');
  const marks=region?[-Z95,Z95]:[-1,0,1];
  marks.forEach((z,i)=>{b+=`<g data-moving-mark="${i}" data-value="${g.centre+g.sd*z}" data-z="${z}" style="transform:translate(${X(z)}px,270px)">`+line(0,-12,0,9,C.teal,2)+'</g>';});
  b+=txt((g.L+g.R)/2,342,phase<.001?'Estimated prevalence':phase<=1?'Difference from 20% (proportion units)':phase>=2-1e-9?'Distance in standard errors':'Changing units',25,C.ink,'middle');
  b+=txt(85,386,phase<1.999?'The view follows the centre and scale. Follow the numerical labels.':'The approximation now matches the standard normal reference.',21,C.muted);
  return `<svg class="chart transform-chart" data-transform-phase="${phase}" data-centre="${g.centre}" data-sd="${g.sd}" viewBox="0 0 1152 403" role="img" aria-label="Centring and rescaling the same normal approximation. The camera follows the changing units, preserving a readable shape. The standard normal uses a separate inset until the scales coincide.">${b}</svg>`;
}
function landmarkStrip(k,inverse=false){
  const rows=[['16%','20%','24%'],['−0.04','0','+0.04'],['−1','0','+1']],phase=inverse?2-k:k;
  return `<div class="landmark-strip">${rows[phase].map((v,i)=>`<span class="${i===1?'rose':''}">${v}</span>`).join('')}</div>`;
}
function normalAreaReading(k){
  const opts=k===0?{lo:-5,hi:5,areaLabel:'100%'}:k===1?{lo:-5,hi:0,areaLabel:'50%',bounds:true}:k===2?{lo:-1,hi:1,areaLabel:'≈ 68%',bounds:true}:{lo:-2,hi:2,areaLabel:'≈ 95%',bounds:true};
  return `<p class="medium">Normal approximation for n = 100: mean 20%, SD 4 percent points.</p>${bell({...opts,hist:k===0})}<p class="bottomline">${['The histogram suggests a shape. Under the normal curve, areas give probabilities.','For a normal distribution, mean = median. Half lies on each side.','Within one standard error of 20%: about 68% under the normal approximation.','Within two standard errors: about 95%. We now need the more precise cutoff.'][k]}</p>`;
}
function marginPicture(k){
  const E=Z95*ci(.18).se,X=x=>130+x/.4*890,B=145;
  let b=line(X(0),B,X(.4),B);
  for(const x of [0,.1,.2,.3,.4])b+=txt(X(x),180,pct(x),25,C.ink,'middle');
  b+=line(X(.18-E),86,X(.18+E),86,C.teal,5)+`<circle cx="${X(.18)}" cy="86" r="8" fill="${C.teal}"/>`+txt(X(.18),128,'18%',27,C.ink,'middle');
  b+=line(X(.18),38,X(.18+E),38,C.rose,3)+line(X(.18),30,X(.18),46,C.rose,2)+line(X(.18+E),30,X(.18+E),46,C.rose,2)+txt(X(.18+E/2),22,'Margin E',25,C.rose,'middle');
  b+=txt(X(.18-E),68,'10.5%',26,C.teal,'middle')+txt(X(.18+E),68,'25.5%',26,C.teal,'middle');
  return svg(b,1152,196,'The interval is centred at the observed estimate of 18 percent; its margin of error is its half-width, about 7.53 percent points.');
}
function planningNumbers(margin=.04,planned=.2,z=1.96){const raw=z*z*planned*(1-planned)/(margin*margin);return {margin,planned,z,raw,n:Math.ceil(raw)};}

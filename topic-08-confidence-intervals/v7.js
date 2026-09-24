 
const v7Rose=(x,y,s,size=24,w=230,h=45)=>smath(x,y,s,size,w,h).replace('<foreignObject','<foreignObject class="v7-rose-math"');
function v7ReferencePair(numeric=false){
 const W=552,B=215,X=z=>42+(z+4)/8*468,Y=d=>B-d*290;
 const curve=(a,b)=>pathCurve(X,Y,a,b,0,1);
 const area=(a,b,color,opacity)=>`<path d="M${X(a)},${B} ${curve(a,b).replace(/^M/,'L')} L${X(b)},${B}Z" fill="${color}" opacity="${opacity}"/>`;
 const reference=sampling=>{
  let b=smath(W/2,0,sampling?tex`\widehat p\ \overset{\scriptscriptstyle\mathrm{approx.}}{\sim}\ \mathcal N\!\left(p,\frac{p(1-p)}{n}\right)`:tex`Z\sim\mathcal N(0,1)`,25,550,55);
  b+=area(-4,-Z95,C.rose,.10)+area(-Z95,Z95,C.teal,.16)+area(Z95,4,C.rose,.10);
  if(sampling){
   const counts=Array(101).fill(0);draws.forEach(d=>counts[d.cases]++);
   counts.forEach((count,k)=>{if(!count)return;const l=X((k/100-.005-P)/SE),r=X((k/100+.005-P)/SE),h=count/draws.length/.01*SE*290;b+=`<rect data-v7-hist data-count="${count}" x="${l}" y="${B-h}" width="${r-l-.7}" height="${h}" fill="${C.teal}" opacity=".27"/>`;});
  }
  b+=`<path data-v7-bell d="${curve(-4,4)}" fill="none" stroke="${C.rose}" stroke-width="3"/>`;
  b+=line(X(-4),B,X(4),B)+line(X(0),92,X(0),B,C.line,1.5,'stroke-dasharray="4 4"');
  for(const z of [-Z95,Z95])b+=line(X(z),Y(density(z,0,1)),X(z),B+7,C.teal,2);
  b+=smath(X(0),65,numeric?tex`95\%`:tex`1-\alpha`,26,140,42);
  for(const z of [-3,3])b+=v7Rose(X(z),160,numeric?tex`2.5\%`:tex`\alpha/2`,22,110,42);
  if(sampling){
   b+=smath(X(-Z95)-10,225,numeric?tex`12.2\%`:tex`p-z_{1-\alpha/2}\,\mathrm{SE}`,20,240,42);
   b+=smath(X(Z95)+10,225,numeric?tex`27.8\%`:tex`p+z_{1-\alpha/2}\,\mathrm{SE}`,20,240,42);
   b+=smath(X(0),225,numeric?tex`20\%`:tex`p`,22,70,42);
  }else{
   b+=smath(X(-Z95),225,numeric?tex`-1.96`:tex`z_{\alpha/2}`,23,190,42)+txt(X(0),249,'0',23,C.ink,'middle')+smath(X(Z95),225,numeric?tex`1.96`:tex`z_{1-\alpha/2}`,23,190,42);
  }
  return svg(b,W,270,sampling?'Sampling distribution centred on true p, with the finite-sample histogram.':'Standard normal reference with central area 1 minus alpha and alpha divided by two in each tail.').replace('class="chart"',`class="chart v7-reference" data-v7-panel="${sampling?'sampling':'standard'}"`);
 };
 return `<div class="v7-reference-pair">${reference(false)}${reference(true)}</div>`;
}
function v7NumericInterval(){
 const c=.18,E=Z95*ci(c).se,X=p=>130+p/.4*890,y=130;
 let b=line(130,240,1020,240);
 for(const p of [0,.1,.2,.3,.4])b+=txt(X(p),275,pct(p),24,C.ink,'middle');
 b+=line(X(c-E),y,X(c+E),y,C.teal,4)+`<circle cx="${X(c)}" cy="${y}" r="8" fill="${C.teal}"/>`;
 b+=smath(X(c-E),78,tex`\widehat p-\textcolor{${C.rose}}{E}`,29,240,48)+smath(X(c),78,tex`\widehat p`,29,100,48)+smath(X(c+E),78,tex`\widehat p+\textcolor{${C.rose}}{E}`,29,240,48);
 b+=txt(X(c-E),172,pct(c-E),27,C.teal,'middle')+txt(X(c+E),172,pct(c+E),27,C.teal,'middle')+txt(X(c),172,'18%',27,C.ink,'middle');
 return svg(b,1152,305,'Observed 95 percent confidence interval: p hat minus E is 10.5 percent, p hat is 18 percent, and p hat plus E is 25.5 percent.').replace('class="chart"','class="chart v7-numeric-chart"');
}
const v7Interval=slides[14];
v7Interval.title='Confidence interval and its margin of error';
v7Interval.className+=' v7-interval';
v7Interval.render=k=>k<2?`<p class="v7-convention">Let ${math(tex`0<\alpha<\tfrac12`)}. Confidence level: ${math(tex`1-\alpha`)}.</p><div class="v7-definition"><span>${math(tex`\mathrm{CI}_{1-\alpha}:\quad\widehat p\pm E`)}</span><span class="v7-margin">${math(tex`E=z_{1-\alpha/2}\,\widehat{\mathrm{SE}}`)}</span></div>${k===1?`<p class="v7-specialisation">95% confidence: ${math(tex`\alpha=0.05,\quad z_{0.975}\approx1.96`)}</p>`:'<p class="v7-specialisation">The margin of error is the half-width of the interval.</p>'}${v7ReferencePair(k===1)}<p class="bottomline">The sampling distribution is centred on ${math(tex`p`)}.</p>`:`<p class="lead">One sample: 18 cases among 100 people.</p><p class="v7-example-level">95% confidence: ${math(tex`\alpha=0.05,\quad z_{0.975}\approx1.96`)}.</p><div class="v7-example-margin">${math(tex`E=1.96\times3.84\%\approx7.53\%`,true)}</div>${v7NumericInterval()}<p class="bottomline">The margin of error is the half-width of the interval.</p>`;
;
Object.assign(window.DECK,{slides});

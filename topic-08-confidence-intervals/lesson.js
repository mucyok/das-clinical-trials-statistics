 
const C={ink:'#22383c',teal:'#167f86',rose:'#bd3c64',pale:'#dce8e9',line:'#bdcdcf',muted:'#59666a'};
const tex=String.raw;
const math=(s,display=false)=>katex.renderToString(s,{displayMode:display,throwOnError:true,strict:'error',trust:false});
const line=(x1,y1,x2,y2,color=C.line,w=2,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" ${extra}/>`;
const txt=(x,y,t,size=24,color=C.ink,anchor='start',extra='')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" style="font-size:${size}px;fill:${color}" ${extra}>${t}</text>`;
const svg=(body,w,h,label)=>`<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${body}</svg>`;
const smath=(x,y,s,size=27,w=350,h=70)=>`<foreignObject x="${x-w/2}" y="${y}" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:${size}px;text-align:center">${math(s)}</div></foreignObject>`;
function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function samples(n,total,seed){const r=rng(seed);return Array.from({length:total},()=>{const data=Array.from({length:n},()=>r()<.2?1:0);const cases=data.reduce((a,b)=>a+b,0);return {data,cases,n,estimate:cases/n};});}
const draws=samples(100,1000,2),P=.2;
const density=(x,mean,sd)=>Math.exp(-.5*((x-mean)/sd)**2)/(sd*Math.sqrt(2*Math.PI));
const pct=x=>{const v=100*x;return v.toFixed(Math.abs(v-Math.round(v))<1e-8?0:1)+'%';};
function pathCurve(X,Y,min,max,mean,sd,scale=1){return Array.from({length:301},(_,i)=>{const x=min+(max-min)*i/300;return `${i?'L':'M'}${X(x).toFixed(2)},${Y(scale*density(x,mean,sd)).toFixed(2)}`;}).join(' ');}
function arrow(x1,y1,x2,y2,color=C.teal){const a=Math.atan2(y2-y1,x2-x1);return line(x1,y1,x2,y2,color,3)+`<path d="M${x2-13*Math.cos(a-.45)},${y2-13*Math.sin(a-.45)}L${x2},${y2}L${x2-13*Math.cos(a+.45)},${y2-13*Math.sin(a+.45)}" fill="none" stroke="${color}" stroke-width="3"/>`;}
function dots(data,w=550,h=290,cols=10){const dx=w/(cols+1),rows=Math.ceil(data.length/cols),dy=h/(rows+1);return svg(data.map((v,i)=>`<g data-key="observation-${i}" style="transform:translate(${dx*(i%cols+1)}px,${dy*(Math.floor(i/cols)+1)}px)"><circle r="${Math.min(10,dx*.3,dy*.33)}" fill="${v?C.teal:C.pale}"/>${v?`<circle r="2.2" fill="white"/>`:''}</g>`).join(''),w,h,`${data.reduce((a,b)=>a+b,0)} cases among ${data.length} observations`);}
function overview(k,mode='sampling'){
 let b=`<rect x="30" y="52" width="420" height="178" rx="4" fill="none" stroke="${C.line}" stroke-width="2"/>`+txt(30,33,'Population',32);
 for(let i=0;i<60;i++)b+=`<circle cx="${52+(i%12)*34}" cy="${76+Math.floor(i/12)*32}" r="7" fill="${i%7===0?C.teal:C.pale}"/>`;
 if(k>=1||mode==='inference'){
 b+=arrow(240,243,240,306)+txt(272,286,'Sampling',24,C.teal);
 b+=`<rect x="95" y="351" width="290" height="105" rx="4" fill="none" stroke="${C.line}" stroke-width="2"/>`+txt(95,335,'Sample',32);
 const selected=[0,1,2,3,7,4,5,6,14,8,9,10,21,11,12,13,28,15];
 for(let i=0;i<18;i++){const origin=selected[i];b+=`<g data-key="selected-${i}" data-origin="${52+(origin%12)*34},${76+Math.floor(origin/12)*32}" style="transform:translate(${121+(i%9)*30}px,${380+Math.floor(i/9)*42}px)"><circle r="8" fill="${i%4===0?C.teal:C.pale}"/></g>`;}
 }
 if(mode==='sampling'){b+=txt(540,112,'The units our question concerns',29)+txt(540,154,'Defined by the question and its scope',24,C.muted);if(k>=1)b+=txt(540,375,'The units for which we have data',29);if(k>=2)b+=txt(540,420,'Here: a random sample',27,C.teal);}
 if(mode==='inference'){
 b+=arrow(409,407,560,407)+txt(485,363,'Describe',24,C.teal,'middle')+txt(605,389,'Sample summaries',30)+txt(605,434,'Means, proportions, graphs',25,C.muted);
 if(k>=1)b+=arrow(865,331,865,224,C.rose)+txt(913,283,'Infer',25,C.rose)+txt(604,109,'Population characteristics',30)+txt(604,154,'A mean, a proportion…',25,C.muted);
 if(k>=2)b+=txt(610,199,'Estimated with uncertainty',27,C.rose);
 }
 return svg(b,1152,475,'Population, sampling, sample summaries, and inference about population characteristics');
}
function recall(k){let b='';b+=txt(65,38,'Dataset',31);for(let r=0;r<6;r++){b+=line(65,65+r*42,405,65+r*42,C.line,1);for(let c=0;c<4;c++)b+=`<rect x="${80+c*80}" y="${76+r*42}" width="${30+(r+c)%3*8}" height="8" fill="${C.pale}"/>`;}
 b+=arrow(455,161,590,161)+txt(665,91,'Summarise',33,C.teal)+txt(665,158,'Visualise',33,C.teal)+txt(665,225,'Describe patterns',33,C.teal);
 if(k)b+=txt(65,388,'What can this sample tell us about its population?',36);
 return svg(b,1152,440,'A dataset supports summaries and visualisation, followed by a question about the population');}
function estimateAxis(k=2){const X=x=>95+x*2400;let b=line(X(.08),175,X(.32),175,C.line,2);for(let x=.1;x<=.301;x+=.05)b+=line(X(x),170,X(x),182,C.line)+txt(X(x),219,pct(x),25,C.ink,'middle');
 draws.slice(0,3).forEach((d,i)=>{b+=`<circle cx="${X(d.estimate)}" cy="${110-i*28}" r="9" fill="${C.teal}"/>`+txt(X(d.estimate),95-i*28,pct(d.estimate),27,C.teal,'middle')+line(X(d.estimate),120-i*28,X(d.estimate),170,C.line,1);});
 b+=txt(680,270,'Estimated prevalence',26,C.ink,'end');return svg(b,850,300,'Three sample proportions: 18 percent, 15 percent and 21 percent');}
function binomial(n,p){let prob=(1-p)**n;const out=[prob];for(let k=0;k<n;k++){prob*=((n-k)/(k+1))*(p/(1-p));out.push(prob);}return out;}
function sizePanel(n){
 const L=65,R=530,T=55,B=313,X=x=>L+x/.4*(R-L),Y=y=>B-y/25*(B-T),sd=Math.sqrt(.16/n),probs=binomial(n,.2);let b=txt(L,28,`n = ${n}`,32)+txt(R,28,'Density',23,C.muted,'end');
 for(const y of [0,10,20])b+=line(L,Y(y),R,Y(y),'#e4ebec',1)+txt(L-12,Y(y)+7,y,22,C.ink,'end');
 b+=line(L,B,R,B);for(const x of [0,.1,.2,.3,.4])b+=txt(X(x),B+31,pct(x),22,C.ink,'middle');
 probs.forEach((pr,k)=>{const x=k/n;if(x>.4)return;const left=Math.max(0,x-.5/n),right=Math.min(.4,x+.5/n);b+=`<rect x="${X(left)}" y="${Y(pr*n)}" width="${Math.max(0,X(right)-X(left))}" height="${B-Y(pr*n)}" fill="${C.teal}" opacity=".4"/>`;});
 b+=`<path d="${pathCurve(X,Y,0,.4,.2,sd)}" fill="none" stroke="${C.rose}" stroke-width="3"/>`+line(X(.2),T,X(.2),B,C.line,2,'stroke-dasharray="5 5"');
 b+=txt(L,395,'Standard error:',24)+txt(L,437,`${(100*sd).toFixed(0)} percentage points`,30,C.teal)+txt(R,362,'Estimated prevalence',22,C.ink,'end');
 return svg(b,552,450,`Sampling distribution for sample size ${n}, same x and y scales; standard error ${100*sd} percentage points`);
}

const slides=[
 {title:'Statistical inference',minutes:1,steps:2,render:k=>`<p class="lead">Descriptive statistics summarise the data in a sample.</p>${recall(k)}`},
 {title:'Population and sample',minutes:1.5,steps:3,render:k=>overview(k)},
 {title:'Descriptive and inferential statistics',minutes:2,steps:3,render:k=>overview(k,'inference')},
];

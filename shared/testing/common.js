 
const C={ink:'#22383c',teal:'#167f86',rose:'#bd3c64',pale:'#dce8e9',line:'#bdcdcf',muted:'#59666a'};
const tex=String.raw;
const math=(s,display=false)=>katex.renderToString(s,{displayMode:display,throwOnError:true,strict:'error',trust:false});
const reveal=(on,s)=>`<div class="${on?'revealed':'hidden-reveal'}">${s}</div>`;
const formula=s=>`<div class="formula">${math(s,true)}</div>`;
const txt=(x,y,t,size=24,color=C.ink,anchor='start',extra='')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" style="font-size:${size}px;fill:${color}" ${extra}>${t}</text>`;
const line=(x1,y1,x2,y2,color=C.line,w=2,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" ${extra}/>`;
const svg=(b,w,h,label)=>`<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${b}</svg>`;
const pct=(x,d=0)=>(100*x).toFixed(d)+'%';
const normalPDF=x=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
function normalCDF(x){const sign=x<0?-1:1,a=Math.abs(x)/Math.sqrt(2),t=1/(1+.3275911*a);const erf=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-a*a);return .5*(1+sign*erf);}
const twoP=z=>Math.min(1,2*normalCDF(-Math.abs(z)));
function normalQuantile(p){let lo=-9,hi=9;for(let i=0;i<70;i++){const mid=(lo+hi)/2;if(normalCDF(mid)<p)lo=mid;else hi=mid;}return (lo+hi)/2;}
const zcrit=a=>normalQuantile(1-a/2);
function sampleStats(k,n=100,p0=.2,alpha=.05){
 const est=k/n,se=Math.sqrt(p0*(1-p0)/n),z=(est-p0)/se,q=zcrit(alpha),q2=q*q;
 
 const den=1+q2/n,mid=(est+q2/(2*n))/den,half=q*Math.sqrt(est*(1-est)/n+q2/(4*n*n))/den;
 return {k,n,est,se,z,pvalue:twoP(z),lo:mid-half,hi:mid+half,reject:Math.abs(z)>q};
}
function normalPower(p1=.3,n=100,alpha=.05,p0=.2){const q=zcrit(alpha),se0=Math.sqrt(p0*(1-p0)/n),se1=Math.sqrt(p1*(1-p1)/n),lo=p0-q*se0,hi=p0+q*se0;const beta=normalCDF((hi-p1)/se1)-normalCDF((lo-p1)/se1);return {lo,hi,beta,power:1-beta,se0,se1};}
function plannedN(target=.9,p1=.3,alpha=.05,p0=.2){for(let n=10;n<=100000;n++){if(normalPower(p1,n,alpha,p0).power>=target)return n;}return null;}
function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
const ensembleCache=new Map();
function ensemble(p=.2,n=100,total=1000){const key=`${p}/${n}/${total}`;if(!ensembleCache.has(key)){const r=rng(2);ensembleCache.set(key,Array.from({length:total},()=>{let k=0;for(let j=0;j<n;j++)k+=r()<p;return sampleStats(k,n);}));}return ensembleCache.get(key);}
function exactRejection(p,n,alpha=.05){let prob=(1-p)**n,sum=0;for(let k=0;k<=n;k++){if(sampleStats(k,n,.2,alpha).reject)sum+=prob;prob*=((n-k)/(k+1))*(p/(1-p));}return sum;}
function sampleDots(k=18,n=100){const seed=rng(67),ids=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(seed()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}const cases=new Set(ids.slice(0,k));let b='';for(let i=0;i<n;i++){const yes=cases.has(i);b+=`<g data-key="person-${i}" style="transform:translate(${40+i%10*37}px,${29+Math.floor(i/10)*31}px)"><circle r="9" fill="${yes?C.teal:C.pale}"/>${yes?'<circle r="2.5" fill="white"/>':''}</g>`;}return svg(b,420,340,`${k} cases among ${n} people in a ten by ten sample`);}
function normalPlot({z=null,mode='two',shade=false,critical=false,proportion=false,cut=.05,labels=true}={}){
 const W=1152,H=327,L=88,R=1060,B=240,A=470,X=x=>L+(x+4)/8*(R-L),Y=x=>B-normalPDF(x)*A;
 const path=(lo,hi)=>Array.from({length:161},(_,i)=>{const x=lo+(hi-lo)*i/160;return `${i?'L':'M'}${X(x).toFixed(2)},${Y(x).toFixed(2)}`;}).join(' ');
 const area=(lo,hi)=>`M${X(lo)},${B} ${path(lo,hi).replace(/^M/,'L')} L${X(hi)},${B} Z`;
 let b='';const q=critical?(mode==='two'?zcrit(cut):1.6448536269514722):Math.abs(z||0),value=z??0;
 const ranges=mode==='two'?[[-4,-q],[q,4]]:mode==='right'?[[critical?1.6448536269514722:value,4]]:[[-4,critical?-1.6448536269514722:value]];
 if(shade||critical)ranges.forEach(([lo,hi])=>{lo=Math.max(-4,lo);hi=Math.min(4,hi);if(hi>lo)b+=`<path data-appear d="${area(lo,hi)}" fill="${C.rose}" opacity=".28"/>`;});
 b+=`<path data-key="normal" d="${path(-4,4)}" fill="none" stroke="${C.ink}" stroke-width="3.3"/>`+line(L,B,R,B);
 for(let x=-3;x<=3;x++)b+=line(X(x),B,X(x),B+7)+txt(X(x),B+35,proportion?pct(.2+.04*x):x,24,C.ink,'middle');
 if(proportion)b+=txt(1045,310,'Sample proportion',23,C.muted,'end');else b+=txt(1045,310,'z-score',23,C.muted,'end');
 b+=txt(575,36,proportion?'If the true prevalence is 20%':'Standard Normal reference',27,C.ink,'middle');
 if(z!==null&&!critical){b+=line(X(value),Y(value),X(value),B,C.teal,3)+`<circle cx="${X(value)}" cy="${B}" r="6" fill="${C.teal}"/>`;if(mode==='two'&&shade)b+=line(X(-value),Y(-value),X(-value),B,C.rose,2,'stroke-dasharray="5 5"');if(labels)b+=txt(X(value)+(value<0?-14:14),105,proportion?pct(.2+.04*value):`z = ${value.toFixed(2)}`,26,C.teal,value<0?'end':'start');}
 if(critical){const qs=mode==='two'?[-q,q]:mode==='right'?[1.6448536269514722]:[-1.6448536269514722];qs.forEach(v=>{b+=line(X(v),Y(v),X(v),B,C.rose,2)+txt(X(v)+(v<0?-12:12),125,v.toFixed(mode==='two'?2:3),26,C.rose,v<0?'end':'start');});b+=txt(100,60,mode==='two'?`${pct(cut/2,1)} in each tail`:`${pct(cut)} in one tail`,24,C.rose);}
 return svg(b,W,H,'Normal reference distribution, observed z-score and tail areas');
}
function ciChart(rows,{nullValue=.2,max=.5,title='Estimated prevalence',truth=null}={}){
 const X=x=>310+x/max*710,B=80+rows.length*96;let b=txt(1060,28,title,25,C.ink,'end')+line(X(nullValue),45,X(nullValue),B,C.muted,2,'stroke-dasharray="5 5"');
 rows.forEach((d,i)=>{const y=82+i*96,color=d.color||C.teal;b+=txt(0,y+7,d.name,27)+line(X(d.lo),y,X(d.hi),y,color,4)+`<circle cx="${X(d.est)}" cy="${y}" r="7" fill="${color}"/>`+txt(X(d.est),y+35,`${pct(d.est)} [${pct(d.lo,1)}, ${pct(d.hi,1)}]`,23,color,'middle');});
 b+=line(X(0),B+10,X(max),B+10);for(let x=0;x<=max+1e-8;x+=.1)b+=txt(X(x),B+42,pct(x),23,C.ink,'middle');b+=txt(X(nullValue),B+82,`Tested value: ${pct(nullValue)}`,23,C.muted,'middle');return svg(b,1152,B+102,'Confidence intervals compared with the tested value');
}
function jamaPlot(k=0){const X=x=>335+(x+5)/25*750;let b=txt(1080,33,'Difference in recovery (%)',27,C.ink,'end')+line(X(0),60,X(0),284,C.muted,2,'stroke-dasharray="5 5"');[['24 h (primary)',4.7,-1.8,11.2],['48 h (secondary)',8.7,1.2,16.2]].forEach(([name,e,l,u],i)=>{const y=107+i*119;b+=txt(15,y+8,name,28)+(i?txt(15,y+40,'Exploratory',22,C.muted):'')+line(X(l),y,X(u),y,C.rose,5)+`<circle cx="${X(e)}" cy="${y}" r="8" fill="${C.teal}"/>`+txt(X(e),y+41,`${e.toFixed(1)} [${l.toFixed(1)}, ${u.toFixed(1)}]`,25,C.rose,'middle');if(k>=1)b+=txt(15,y+75,i?'Published p-value = 0.03':'Published p-value = 0.14',22,C.teal);});b+=line(X(-5),313,X(20),313);for(const x of [-5,0,5,10,15,20])b+=txt(X(x),346,x,23,C.ink,'middle');b+=txt(X(0),388,'0 = no difference',24,C.muted,'middle');return svg(b,1152,410,'Published JAMA overall risk differences: 24 hours 4.7, CI minus 1.8 to 11.2; 48 hours 8.7, CI 1.2 to 16.2');}
function decisionTable(k=0,focus=''){const cell=(visible,text,cls='')=>`<td class="${cls}">${visible?text:''}</td>`;return `<table class="table matrix"><thead><tr><th>Our decision</th><th>H₀ is true</th><th>H₀ is false</th></tr></thead><tbody><tr><th>Reject H₀</th>${cell(k>=1,'Type I error<br><span class="small rose">False alarm</span>',focus==='I'?'mistake':'')}${cell(k>=2,'Correct detection',focus==='power'?'highlight':'')}</tr><tr><th>Do not reject H₀</th>${cell(k>=1,'Correct non-rejection')}${cell(k>=2,'Type II error<br><span class="small rose">Missed effect</span>',focus==='II'?'mistake':'')}</tr></tbody></table>`;}
function intervalScene({p=.2,n=100,alpha=.05,total=1000,start=0,word='Reject H₀',controls=false,showRate=true}={}){
 const data=ensemble(p,n),items=data.slice(0,total).map(d=>sampleStats(d.k,n,.2,alpha)),reject=items.filter(d=>d.reject).length,rows=items.slice(start,start+40),X=x=>110+x/.6*730;
 let b=line(X(.2),20,X(.2),309,C.ink,2,'stroke-dasharray="5 5"');if(p!==.2)b+=line(X(p),20,X(p),309,C.line,2,'stroke-dasharray="3 5"');
 rows.forEach((d,i)=>{const y=32+i*6.7,col=d.reject?C.rose:C.teal;b+=`<g data-key="interval-${start+i}" data-reject="${d.reject}" data-k="${d.k}" style="transform:translate(${X(d.est)}px,${y}px)">`+line(X(Math.max(0,d.lo))-X(d.est),0,X(Math.min(.6,d.hi))-X(d.est),0,col,1.8,d.reject?'stroke-dasharray="3 2"':'')+`<circle r="2.9" fill="${col}"/></g>`;});
 b+=line(X(0),315,X(.6),315);for(let x=0;x<=.60001;x+=.1)b+=txt(X(x),347,pct(x),21,C.ink,'middle');b+=txt(X(.2),384,'Tested: 20%',23,C.ink,'middle');if(p!==.2)b+=txt(X(p)+10,18,`True: ${pct(p)}`,21,C.muted,'start');
 b+=line(897,74,945,74,C.rose,3,'stroke-dasharray="4 3"')+txt(960,81,word,23,C.rose)+line(897,117,945,117,C.teal,3)+txt(960,124,'Do not reject',23,C.teal);
 if(showRate)b+=txt(920,207,`${reject} / ${total}`,36,C.rose)+txt(920,244,`${total?(reject/total*100).toFixed(1):0}%`,30,C.rose);
 b+=txt(905,301,'One line = one study',21,C.muted);
 return `<div class="scene-settings"><span>True prevalence: <strong>${pct(p)}</strong></span><span>People per study: <strong>${n}</strong></span><span>Significance level: <strong>${pct(alpha)}</strong></span></div>${svg(b,1152,398,'Repeated confidence intervals classified by whether they exclude the tested prevalence of 20 percent')}<p class="scene-foot">${rows.length} intervals shown${total>40?`, ${total.toLocaleString('en')} studies counted`:''}. Pink dashed lines exclude 20%. The Normal calculation is approximate.</p>${controls?`<div class="scene-controls"><button data-repeat>Replay studies</button><button data-all>Show 1,000</button><button data-window>Next 40 intervals</button></div>`:''}`;
}
function rateCompare(configs){const base=80;let b=txt(1115,28,'Calculated power',24,C.muted,'end');configs.forEach(({label,p,n,alpha=.05},i)=>{const r=exactRejection(p,n,alpha),y=base+i*115;b+=txt(0,y+8,label,label.startsWith('Significance')?24:28)+`<rect x="315" y="${y-18}" width="650" height="35" fill="${C.pale}"/><rect data-grow x="315" y="${y-18}" width="${r*650}" height="35" fill="${C.teal}"/>`+txt(1005,y+8,pct(r,1),30,C.teal)+txt(315,y+51,`True prevalence ${pct(p)} · ${n} people · significance level ${pct(alpha)}`,22,C.muted);});return svg(b,1152,base+configs.length*115,'Detection probability for specified true prevalence, study size and significance level');}
const jellyP=[.54,.82,.13,.61,.34,.72,.19,.93,.41,.27,.63,.16,.88,.37,.02,.46,.57,.31,.68,.24];
const jellyNames=['Purple','Brown','Pink','Blue','Teal','Salmon','Red','Turquoise','Magenta','Yellow','Grey','Tan','Cyan','Mauve','Green','Peach','Orange','Black','Beige','Lilac'];
function testsGrid(mode='all'){return `<div class="family-grid">${jellyP.map((p,i)=>`<div class="family-test ${p<.05?'hit':''} ${mode==='selected'&&p>=.05?'dim':''}">${jellyNames[i]}<small>p = ${p.toFixed(2)}</small></div>`).join('')}</div>`;}

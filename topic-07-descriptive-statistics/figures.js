 
const C={ink:'#22383c',teal:'#167f86',rose:'#bd3c64',pale:'#e4f0f0',gray:'#8d9ea2'};

const firstWaits=[7.4,2.2,5.4,1.4,4.6,6.2,3.8,21.0];
const firstGroups=['A','O','B','A','AB','O','A','O'];
let recordSeed=162;
const recordRandom=()=>{recordSeed=(1664525*recordSeed+1013904223)>>>0;return recordSeed/4294967296};
const remainingGroups=Object.entries({A:75,B:15,AB:6,O:66}).flatMap(([g,n])=>Array(n-firstGroups.filter(v=>v===g).length).fill(g));
for(let i=remainingGroups.length-1;i>0;i--){const j=Math.floor(recordRandom()*(i+1));[remainingGroups[i],remainingGroups[j]]=[remainingGroups[j],remainingGroups[i]]}
const records=[...firstGroups,...remainingGroups].map((blood,i)=>({id:String(i+1).padStart(3,'0'),blood,severity:['Mild','Moderate','Severe'][Math.floor(recordRandom()*3)],visits:Math.floor(recordRandom()*5),wait:firstWaits[i]??Math.round((1+recordRandom()*22)*10)/10}));
const observed=records.slice(0,7).map(r=>r.wait);
const series=records.slice(0,8).map(r=>r.wait).sort((a,b)=>a-b);
const bloodCounts=['A','B','AB','O'].map(g=>records.filter(r=>r.blood===g).length);
function recordsTable({types=false,definitions=false,focus=false}={}){
 const headings=['Person ID','Blood group','Severity','Visits','Waiting time (min)'];
 const typeNames=['','Nominal','Ordinal','Discrete','Continuous'];
 const typeDefinitions=['','no particular order','there is an order','separate values','a value on a scale'];
 return `<table class="table records ${focus?'focus-wait':''}"><colgroup><col style="width:14%"><col style="width:21%"><col style="width:22%"><col style="width:14%"><col style="width:29%"></colgroup><thead><tr>${headings.map((h,i)=>`<th><span class="variable-type" style="visibility:${types&&i?'visible':'hidden'}" ${types&&i?'data-reveal="type-'+i+'"':''}>${typeNames[i]||'Type'}</span><span class="variable-definition" style="visibility:${definitions&&i?'visible':'hidden'}" ${definitions&&i?'data-reveal="definition-'+i+'"':''}>${typeDefinitions[i]||'Definition'}</span><span class="variable-name">${h}</span></th>`).join('')}</tr></thead><tbody>${records.slice(0,7).map(r=>`<tr><td>${r.id}</td><td>${r.blood}</td><td>${r.severity}</td><td>${r.visits}</td><td>${r.wait.toFixed(1)}</td></tr>`).join('')}</tbody></table>`;
}
function fullRecords(){return `<div class="full-records" aria-label="Overview of all 162 fictional records; next step enlarges the first seven rows.">${Array.from({length:6},(_,part)=>`<table><thead><tr><th>ID</th><th>Group</th><th>Severity</th><th>Visits</th><th>Wait</th></tr></thead><tbody>${records.slice(part*27,(part+1)*27).map(r=>`<tr><td>${r.id}</td><td>${r.blood}</td><td>${r.severity}</td><td>${r.visits}</td><td>${r.wait.toFixed(1)}</td></tr>`).join('')}</tbody></table>`).join('')}</div>`}
function countsTable(percent=true){return `<table class="table"><thead><tr><th>Blood group</th><th>n</th><th style="visibility:${percent?'visible':'hidden'}">%</th></tr></thead><tbody>${bloodCounts.map((n,i)=>`<tr><td>${['A','B','AB','O'][i]}</td><td>${n}</td><td style="visibility:${percent?'visible':'hidden'}">${Math.round(100*n/records.length)}</td></tr>`).join('')}<tr class="total"><td>Total</td><td>162</td><td style="visibility:${percent?'visible':'hidden'}">100</td></tr></tbody></table>`}
const sleep=[12,8.5,7.2,7.3,7.7,6,6.5,4.5,3,1.2,1.3,2,2,3.8,6.6,8.5,5.9,4.6,5.6,6.7];
const paired={before:[1,1.2,1.3,1.5,1.7,1.8,2,2.1,2.3,2.4,2.6,2.8],marked:[2.4,2.5,2.8,2.9,3.1,3.3,3.2,3.6,3.5,3.8,3.9,4.2],small:[1.2,1.1,1.6,1.4,2,1.7,2.2,2,2.6,2.3,2.9,2.7]};
const median=a=>{const s=[...a].sort((a,b)=>a-b),m=s.length/2;return Number.isInteger(m)?(s[m-1]+s[m])/2:s[Math.floor(m)]};
function stats(a){const s=[...a].sort((a,b)=>a-b),n=s.length,q1=median(s.slice(0,Math.floor(n/2))),q3=median(s.slice(Math.ceil(n/2))),iqr=q3-q1;return{min:s[0],max:s[n-1],q1,q3,median:median(s),iqr,low:q1-1.5*iqr,high:q3+1.5*iqr,wl:s.find(x=>x>=q1-1.5*iqr),wh:[...s].reverse().find(x=>x<=q3+1.5*iqr)}}
const txt=(x,y,t,size=24,fill=C.ink,anchor='middle')=>`<text x="${x}" y="${y}" style="font-size:${size}px;fill:${fill}" text-anchor="${anchor}">${t}</text>`;
const line=(x,y,x2,y2,color=C.ink,width=2,extra='')=>`<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const svg=(body,w=1152,h=350,label='Statistical graphic')=>`<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${body}</svg>`;

const tex=String.raw;
const math=(source,display=false)=>katex.renderToString(source,{displayMode:display,throwOnError:true,strict:'error',output:'htmlAndMathml',trust:false});
const mathSvg=(x,y,source,size=24,color=C.ink,width=460,height=90)=>`<foreignObject x="${x-width/2}" y="${y-size}" width="${width}" height="${height}" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math" style="font-size:${size}px;color:${color};text-align:center">${math(source)}</div></foreignObject>`;



 
function numberScene(mode,k){
 const s=stats(series),fmt=v=>Number(v.toFixed(3)),vals=mode==='odd'?observed:series;
 const order=mode==='odd'&&k===0?vals:[...vals].sort((a,b)=>a-b);
 const axis=mode==='box'&&k>=2||mode==='tukey',axisX=v=>190+(v+4)*36;
 const rank=v=>{const i=series.findIndex(x=>x>=v);if(i<=0)return 135;return 135+(i-1+(v-series[i-1])/(series[i]-series[i-1]))*126};
 const pos=v=>axis?axisX(v):rank(v),xs=v=>axis?axisX(v):135+order.indexOf(v)*126,yy=axis?164:148;
 const oddMedian=median(observed),mid=series.slice(3,5);
 const hot=mode==='odd'&&k>=2?[oddMedian]:mode==='even'&&k>=2?mid:mode==='quart'&&k>=1?[...series.slice(1,3),...series.slice(5,7)]:[];
 let b='';
 if(mode==='quart')b+=line(98,90,548,90,C.teal,3)+line(600,90,1054,90,C.teal,3)+txt(323,67,'Lower half',24,C.teal)+txt(827,67,'Upper half',24,C.teal);
 if(mode==='odd'&&k===3)b+=line(104,216,424,216,C.teal,3)+line(604,216,926,216,C.teal,3)+txt(264,255,'3 values',26,C.teal)+txt(765,255,'3 values',26,C.teal);
 if(mode==='even'&&k>=3)b+=line(513,190,513,226,C.teal,3)+line(639,190,639,226,C.teal,3)+line(513,226,639,226,C.teal,3)+txt(576,270,fmt(s.median),40,C.teal);
 if(mode==='quart'&&k>=1)b+=mathSvg(323,246,tex`Q_1=\dfrac{2.2+3.8}{2}=3.0`,27,C.teal)+mathSvg(827,246,tex`Q_3=\dfrac{6.2+7.4}{2}=6.8`,27,C.teal);
 if(mode==='box'||mode==='tukey'){
  if(axis){b+=line(185,270,1110,270,C.gray,2);for(let t=-4;t<=20;t+=4)b+=line(pos(t),270,pos(t),279,C.gray)+txt(pos(t),306,t,21,C.ink);b+=txt(1120,337,'Waiting time (min)',23,C.ink,'end')}
  for(const [v,t]of [[s.q1,tex`Q_1=3.0`],[s.median,tex`\mathrm{Median}=5.0`],[s.q3,tex`Q_3=6.8`]]){
   const labelY=axis?(v===s.median?56:91):64;
   b+=`<g data-key="quartile-${v}" style="transform:translate(${pos(v)}px,0px)">`+line(0,labelY+13,0,axis?128:108,C.teal,2)+mathSvg(0,labelY,t,axis?20:23,C.teal,260,60)+'</g>';
  }
  if(mode==='box'&&k>=1||mode==='tukey')b+=line(pos(s.q1),225,pos(s.q3),225,C.teal,4)+mathSvg((pos(s.q1)+pos(s.q3))/2,axis?365:268,tex`\mathrm{IQR}=6.8-3.0=3.8`,23,C.teal);
  if(mode==='box'&&k>=3||mode==='tukey')b+=`<rect data-key="box" x="${pos(s.q1)}" y="126" width="${pos(s.q3)-pos(s.q1)}" height="76" fill="${C.pale}" stroke="${C.teal}" stroke-width="3"/>`;
  if(mode==='box'&&k>=4||mode==='tukey')b+=line(pos(s.median),126,pos(s.median),202,C.teal,4);
  if(mode==='tukey'&&k>=1&&k<4)for(const v of [s.low,s.high])b+=line(pos(v),114,pos(v),249,C.rose,2,'stroke-dasharray="7 5"')+txt(pos(v),100,fmt(v),25,C.rose);
  if(mode==='tukey'&&k>=2){b+=line(pos(s.wl),164,pos(s.q1),164,C.teal,3)+line(pos(s.q3),164,pos(s.wh),164,C.teal,3)+line(pos(s.wl),143,pos(s.wl),185,C.teal,3)+line(pos(s.wh),143,pos(s.wh),185,C.teal,3);b+=txt(pos(s.wl),247,fmt(s.wl),23,C.teal)+txt(pos(s.wh),247,fmt(s.wh),23,C.teal)}
 }
 vals.forEach(v=>{
  let show=!(mode==='even'&&k===0&&v===21),opacity=mode==='box'&&k>=3?0.35:1;
  if(mode==='tukey'){show=k<4||v===21;opacity=k<3&&v!==21?0.35:1}
  const outer=v===21&&mode==='tukey'&&k>=2;
  b+=`<g class="token ${hot.includes(v)?'hot':''} ${outer?'outer':''}" data-key="value-${v}" style="transform:translate(${xs(v)}px,${yy}px);opacity:${show?opacity:0}"><circle r="${axis?7:34}" ${axis?`style="fill:${outer?C.rose:C.ink};stroke:white;stroke-width:1.5"`:''}/><text y="${axis?49:0}" style="font-size:${axis?22:28}px;opacity:${axis&&v!==21?0:1}">${v.toFixed(1)}</text></g>`;
 });
 return `<svg class="series" viewBox="0 0 1152 390" role="img" aria-label="${mode}: ${order.join(', ')} minutes. Construction step ${k+1}">${b}</svg>`;
}
function histogram(width){const counts=[];for(let lo=0;lo<12;lo+=width)counts.push(sleep.filter(x=>x>=lo&&(x<lo+width||lo+width===12&&x===12)).length);let b='';const X=x=>100+x*75,Y=n=>330-n*23;for(let n=0;n<=12;n+=3)b+=line(100,Y(n),1000,Y(n),'#dbe2e3',1)+txt(75,Y(n)+7,n,22);b+=txt(102,25,'People',23,C.ink,'start');counts.forEach((n,i)=>{const x=X(i*width),w=width*75;b+=`<rect data-key="hist-${i}" x="${x}" y="${Y(n)}" width="${w}" height="${n*23}" fill="${i===3&&width===2?C.teal:'#a7cacc'}" stroke="white" stroke-width="2"/>`+txt(x+w/2,Y(n)-12,n,25)});b+=line(100,330,1000,330);for(let t=0;t<=12;t+=2)b+=txt(X(t),364,t,23);b+=txt(1000,405,'Sleep last night (hours)',25,C.ink,'end');return svg(b,1152,425,`Histogram of the same 20 sleep values, bin width ${width} hours. Counts ${counts.join(', ')}`)}
function barChart(){let b=line(65,310,520,310);const ns=bloodCounts;for(let n=0;n<=80;n+=20)b+=txt(40,315-n*3,n,21)+line(64,310-n*3,525,310-n*3,'#dbe2e3',1);ns.forEach((n,i)=>{const x=90+i*110;b+=`<rect x="${x}" y="${310-n*3}" width="65" height="${n*3}" fill="${C.teal}"/>`+txt(x+32,296-n*3,n,25)+txt(x+32,348,['A','B','AB','O'][i],24)});return svg(txt(65,30,'People',23,C.ink,'start')+b,550,370,'Blood groups: A 75, B 15, AB 6, O 66')}
function comparison(){let b='';const Y=v=>347-v*55;for(let panel=0;panel<2;panel++){let ox=panel*575;const X=g=>ox+230+g*190;b+=txt(ox+300,31,panel===0?'A marked difference':'A small difference',29);for(let t=0;t<=5;t+=1)b+=line(ox+100,Y(t),ox+505,Y(t),'#dbe2e3',1)+txt(ox+80,Y(t)+7,t,21);b+=txt(ox+100,62,'FEV₁ (L)',22,C.ink,'start');const data=[paired.before,panel?paired.small:paired.marked];data.forEach((arr,g)=>{const s=stats(arr),x=X(g);b+=line(x,Y(s.wl),x,Y(s.wh),C.teal,2)+line(x-17,Y(s.wl),x+17,Y(s.wl),C.teal,2)+line(x-17,Y(s.wh),x+17,Y(s.wh),C.teal,2)+`<rect x="${x-38}" y="${Y(s.q3)}" width="76" height="${Y(s.q1)-Y(s.q3)}" fill="${C.pale}" stroke="${C.teal}" stroke-width="2"/>`+line(x-38,Y(s.median),x+38,Y(s.median),C.teal,4);arr.forEach((v,i)=>b+=`<circle cx="${x+((i*7)%9-4)*6}" cy="${Y(v)}" r="5.5" fill="${C.ink}" stroke="white" stroke-width="1"/>`);b+=txt(x,380,g?'After':'Before',24)+txt(x,410,`Median ${Number(s.median.toFixed(2))} L`,20,C.teal)});}return svg(b,1152,432,'Two fictional before-after scenarios, the same 12 people and FEV1 lung function measure. Both axes range from 0 to 5 L; individual points and boxplots shown.')}

const fictionalSoreThroat={
 marked:{placebo:[2.6,3.1,3.4,3.8,4.1,4.4,4.7,5.0,5.4,5.9,6.2,6.8],dexamethasone:[1.2,1.6,1.9,2.1,2.4,2.6,2.9,3.1,3.4,3.7,4.0,4.4]},
 small:{placebo:[1.5,2.0,2.6,3.0,3.4,3.8,4.2,4.6,5.0,5.5,6.1,6.8],dexamethasone:[1.4,1.9,2.5,2.9,3.3,3.7,4.0,4.5,5.0,5.4,6.0,6.7]}
};
function soreThroatComparison(){
 let b='';const Y=v=>324-v*34;
 for(let panel=0;panel<2;panel++){
  const ox=panel*575,X=g=>ox+230+g*190,scenario=panel?fictionalSoreThroat.small:fictionalSoreThroat.marked;
  b+=txt(ox+300,28,panel?'A small difference':'A marked difference',28);
  for(let t=0;t<=8;t+=2)b+=line(ox+100,Y(t),ox+505,Y(t),'#dbe2e3',1)+txt(ox+80,Y(t)+7,t,20);
  b+=txt(ox+100,58,'Days',21,C.ink,'start');
  [scenario.placebo,scenario.dexamethasone].forEach((arr,g)=>{
   const s=stats(arr),x=X(g);
   b+=line(x,Y(s.wl),x,Y(s.wh),C.teal,2)+line(x-17,Y(s.wl),x+17,Y(s.wl),C.teal,2)+line(x-17,Y(s.wh),x+17,Y(s.wh),C.teal,2);
   b+=`<rect x="${x-38}" y="${Y(s.q3)}" width="76" height="${Y(s.q1)-Y(s.q3)}" fill="${C.pale}" stroke="${C.teal}" stroke-width="2"/>`+line(x-38,Y(s.median),x+38,Y(s.median),C.teal,4);
   arr.forEach((v,i)=>b+=`<circle cx="${x+((i*7)%9-4)*6}" cy="${Y(v)}" r="5.5" fill="${C.ink}" stroke="white" stroke-width="1"/>`);
   b+=txt(x,358,g?'Dexamethasone':'Placebo',21)+txt(x,389,`Median ${Number(s.median.toFixed(2))} days`,18,C.teal);
  });
 }
 return svg(b,1152,410,'Two explicitly fictional comparisons of sore-throat duration in days for placebo and dexamethasone groups. The left panel shows a marked observed difference and the right panel a small observed difference. Individual points and boxplots are shown on identical axes from 0 to 8 days.');
}

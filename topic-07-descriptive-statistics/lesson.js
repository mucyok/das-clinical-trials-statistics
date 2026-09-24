 
const compactWaits=[5.8,6.0,6.3,6.5,6.5,6.7,7.0,7.2];
function spreadOffsets(arr,scale){
 const placed=[];
 return arr.map(v=>{const x=scale(v);const y=[0,-15,15,-30,30,-45,45].find(y=>placed.every(p=>Math.hypot(x-p.x,y-p.y)>=15));placed.push({x,y});return y});
}
function meanBuild(k){
 let b='';observed.forEach((v,i)=>{const x=170+i*132;
 b+=`<g data-key="mean-value-${i}" style="transform:translate(${x}px,${k?35:80}px)">${mathSvg(0,0,String(v),31,C.ink,100,60)}</g>`;
 b+=`<g data-key="mean-index-${i}" style="transform:translate(${k===2?580:x}px,${k===2?155:105}px);opacity:${k===1?1:0}">${mathSvg(0,0,`x_${i+1}`,29,C.teal,110,60)}</g>`;});
 const expanded=tex`\bar{x}=\frac{x_1+x_2+x_3+x_4+x_5+x_6+x_7}{7}\approx4.43`;
 if(k<2){const formula=k===0?tex`\bar{x}=\frac{7.4+2.2+5.4+1.4+4.6+6.2+3.8}{7}\approx4.43`:expanded;b+=`<foreignObject x="25" y="185" width="1100" height="170"><div xmlns="http://www.w3.org/1999/xhtml" class="mean-equation" data-reveal="mean-formula-${k}">${math(formula,true)}</div></foreignObject>`;}
 else b+=`<foreignObject x="25" y="175" width="1100" height="85"><div xmlns="http://www.w3.org/1999/xhtml" class="mean-equation">${math(expanded,true)}</div></foreignObject><foreignObject x="25" y="275" width="1100" height="95"><div xmlns="http://www.w3.org/1999/xhtml" class="mean-equation" data-reveal="mean-sigma">${math(tex`\bar{x}=\frac{1}{7}\sum_{i=1}^{7}x_i\approx4.43`,true)}</div></foreignObject>`;
 return svg(b,1152,380,'Mean of the seven observed values; the expanded indexed sum remains visible when sigma notation appears.');
}
function extremeBuild(k){let b='';series.forEach((v,i)=>{const value=i===7&&k?201:v;b+=`<g data-key="extreme-${i}" style="transform:translate(${130+126*i}px,75px)"><circle r="${i===7?43:30}" fill="${i===7?C.rose:'white'}" stroke="${i===7?C.rose:C.gray}" stroke-width="2"/><text data-count="extreme-number-${i}" data-value="${value}" style="font-size:32px;fill:${i===7?'white':C.ink}" text-anchor="middle" dominant-baseline="central">${value}</text></g>`});return svg(b,1152,160,'Replace only 21.0 by 201.0 minutes; the other seven observations are unchanged.');}
function dispersionBuild(k){
 const datasets=[compactWaits,series];let b='';const X=x=>125+x*39;
 if(k>=1){for(const y of [95,220])b+=line(X(0),y,X(21),y,'#cad5d7',2);for(const t of [0,6.5,12,20])b+=txt(X(t),287,t,22);b+=line(X(6.5),55,X(6.5),253,C.rose,2,'stroke-dasharray="6 5"')+mathSvg(X(6.5),33,tex`\bar{x}=6.5`,25,C.rose,220,50);b+=txt(1010,287,'Minutes',23)}
 datasets.forEach((arr,row)=>{const offsets=spreadOffsets(arr,X);b+=txt(10,row?227:102,row?'B':'A',29,C.ink,'start');arr.forEach((v,i)=>{const stack=offsets[i];const x=k?X(v):150+i*99,y=k?(row?220:95)+stack:(row?220:95);b+=`<g data-key="spread-${row}-${i}" style="transform:translate(${x}px,${y}px)"><circle r="${k?6:0}" fill="${C.teal}"/><text style="font-size:30px;opacity:${k?0:1}" text-anchor="middle" dominant-baseline="central">${v}</text></g>`});
 if(k===0)b+=mathSvg(1030,row?228:103,tex`\bar{x}=6.5`,26,C.rose,210,55);
 if(k>=2)b+=mathSvg(1040,row?221:96,row?tex`s\approx6.18`:tex`s\approx0.47`,25,C.teal,200,60);
 });return svg(b,1152,310,'Two datasets of eight waiting times, both with mean 6.5 minutes; spread differs.');
}
function histogramBuild(k){
 const X=x=>100+x*75,Y=n=>330-n*23;let b='';const counts=[2,4,4,7,2,1];
 if(k===0){for(let row=0;row<2;row++){const y=70+row*160;b+=txt(12,y,'Person',22,C.ink,'start')+txt(12,y+55,'Hours',22,C.ink,'start');b+=line(90,y+16,1120,y+16,'#cad5d7',2);for(let i=0;i<10;i++)b+=txt(150+102*i,y,row*10+i+1,22,C.ink)}}
 if(k>=1){for(let n=0;n<=12;n+=3)b+=txt(75,Y(n)+7,n,22)+line(100,Y(n),1000,Y(n),'#dde5e6',1);b+=txt(102,25,'People',23,C.ink,'start')+line(100,330,1000,330);for(let t=0;t<=12;t+=2)b+=txt(X(t),364,t,23);b+=txt(1000,405,'Sleep last night (hours)',25,C.ink,'end');}
 counts.forEach((n,i)=>{b+=`<rect data-key="build-bin-${i}" class="bar-morph" x="${X(i*2)}" y="${Y(n)}" width="150" height="${n*23}" fill="${i===3?C.teal:'#a7cacc'}" stroke="white" stroke-width="2" style="opacity:${k>=2?1:0}"/>`;if(k>=2)b+=txt(X(i*2)+75,Y(n)-12,n,24)});
 const seen=Array(6).fill(0);sleep.forEach((v,i)=>{const bin=Math.min(5,Math.floor(v/2)),rank=++seen[bin];const x=k?X(bin*2)+75:150+102*(i%10),y=k?Y(rank)+12:125+160*Math.floor(i/10);b+=`<g data-key="sleep-${i}" style="transform:translate(${x}px,${y}px);opacity:${k===3?0:1}"><circle r="${k?10:0}" fill="${k===2?'white':C.teal}" stroke="${C.teal}"/><text text-anchor="middle" dominant-baseline="central" style="font-size:27px;opacity:${k?0:1}">${v}</text></g>`});return svg(b,1152,430,'Twenty sleep records move from a table into equal-width intervals, then become histogram bars.');
}
function histogramWithBox(width){
 const summary=stats(sleep),X=x=>150+x*74,Y=n=>393-n*19,counts=[];
 for(let lo=0;lo<12;lo+=width)counts.push(sleep.filter(x=>x>=lo&&(x<lo+width||lo+width===12&&x===12)).length);
 let b=txt(12,76,'Boxplot',24,C.ink,'start')+txt(12,192,'People',24,C.ink,'start');
 b+=line(X(summary.wl),68,X(summary.wh),68,C.teal,3)+line(X(summary.wl),51,X(summary.wl),85,C.teal,3)+line(X(summary.wh),51,X(summary.wh),85,C.teal,3);
 b+=`<rect x="${X(summary.q1)}" y="43" width="${X(summary.q3)-X(summary.q1)}" height="50" fill="${C.pale}" stroke="${C.teal}" stroke-width="3"/>`+line(X(summary.median),43,X(summary.median),93,C.teal,4);
 for(let t=0;t<=12;t+=2)b+=line(X(t),110,X(t),393,'#e2e8e9',1);
 for(let n=0;n<=12;n+=3)b+=txt(120,Y(n)+7,n,22)+line(150,Y(n),1038,Y(n),'#e2e8e9',1);
 counts.forEach((n,i)=>{const x=X(i*width),w=width*74;b+=`<rect data-key="hist-${i}" x="${x}" y="${Y(n)}" width="${w}" height="${n*19}" fill="${C.teal}" stroke="white" stroke-width="2"/>`+txt(x+w/2,Y(n)-10,n,24)});
 b+=line(150,393,1038,393);for(let t=0;t<=12;t+=2)b+=txt(X(t),427,t,23);
 b+=txt(1038,468,'Sleep last night (hours)',25,C.ink,'end');
 return svg(b,1152,480,`Same 20 sleep observations: unchanged boxplot above a histogram with ${width}-hour intervals. Counts ${counts.join(', ')}.`);
}
const titleMean='Measures of centre';
const titleSpread='Measures of dispersion';
const titleBox='Visualising numerical data: boxplots';
const titleHist='Visualising numerical data: histograms';
const slides=[
 {title:'Descriptive statistics',minutes:0.5,steps:1,className:'title-slide',render:()=>`<p class="course">DAS · Statistics</p><h1>Descriptive statistics</h1><p class="title-question">Describing the data we observed</p><div class="route"><span>Types of variables</span><span>Numerical summaries</span><span>Visualisation</span></div>`},
 {title:'Statistics in a clinical trial',minutes:2.5,steps:2,className:'article-slide',render:k=>`<div class="article-layout"><img class="article-page" src="assets/jama_first_page.png" alt="First page of the JAMA randomised trial of dexamethasone versus placebo for acute sore throat."><div><p class="medium">Hayward et al. · JAMA · 2017</p><img class="conclusion-crop" src="assets/jama_conclusions.png" alt="Conclusions: no increase in resolution at 24 hours; a significant difference at 48 hours."><p class="question" ${k?'':'style="visibility:hidden"'}>How do the observed data support these clinical conclusions?</p></div></div>`},
 {title:'Descriptive statistics',minutes:1.5,steps:2,render:k=>`<div class="cols intro-summary"><div><p class="lead">Organise observations</p><p class="medium">A table may be enough for a small dataset.</p><div class="rule"></div><p class="medium">With hundreds of participants:</p><p class="medium teal">graphs and numerical summaries.</p></div><div><p class="medium">JAMA Table 1 is already a summary.</p><img class="jama" src="assets/jama_overview.png" alt="Original baseline summary table, All Patients columns."></div></div>${k?'<p class="bottomline">Describe the observed data before asking what we can conclude beyond them.</p>':''}`},
 {title:'Types of variables',minutes:2,steps:1,render:()=>`<p class="lead">Collected information can have different forms.</p><div class="tree"><div><h2>Categorical</h2><div class="branch"><div><h3>Nominal</h3><p>No natural order</p><p class="teal">Blood group</p></div><div><h3>Ordinal</h3><p>Ordered categories</p><p class="teal">Symptom severity</p></div></div></div><div><h2>Numerical</h2><div class="branch"><div><h3>Discrete</h3><p>Separate values</p><p class="teal">Number of visits</p></div><div><h3>Continuous</h3><p>Values along a scale</p><p class="teal">Waiting time (min)</p></div></div></div></div>`},
 {title:'Types of variables',minutes:2,steps:3,className:'records-slide',render:k=>`<p class="medium">Suppose we collect these data from 162 clinic visitors.</p>${k===0?fullRecords():recordsTable({types:k===2})}<p class="records-caption">${k===0?'162 people · one table of observations':'An enlarged view of rows 001–007'}</p>`},
 {title:'Numerical summaries: categorical data',minutes:2,steps:2,className:'categorical-summary',render:k=>`<p class="medium">Summarise the blood groups of the same 162 people.</p><div class="categorical-summary-layout"><div>${countsTable(k===1)}</div><div class="summary-explanation"><p class="lead">${k?'Percentage':'Count'}</p><p class="medium">${k?'Express each count as a share of the total.':'Count the records in each category.'}</p>${k?`<p class="big">${math(tex`\frac{75}{162}\approx46\%`)}</p>`:'<p class="big teal">75 people with blood group A</p>'}</div></div>`},
 {title:'Visualising categorical data',minutes:1.5,steps:1,className:'categorical-plot',render:()=>`<p class="medium">The same blood-group counts, shown as bars.</p><div class="cols"><div>${countsTable(true)}</div><div>${barChart()}</div></div><p class="bottomline">Bar height represents the number of people.</p>`},
 {title:titleMean,minutes:2,steps:4,className:'mean-slide records-recall',render:k=>k===0?`<p class="medium">Return to the table: select waiting time for rows 001–007.</p>${recordsTable({focus:true})}<p class="records-caption">Use these seven observations to work through the calculation.</p>`:`<p class="lead">Mean waiting time · minutes</p>${meanBuild(k-1)}<p class="scene-sub">${k===1?'Add the seven waiting times, then divide by seven.':k===2?'Give each observation an index.':`In general: ${math(tex`\bar{x}=\frac{1}{n}\sum_{i=1}^{n}x_i`)}.`}</p>`},
 {title:titleMean,minutes:2,steps:4,render:k=>`<p class="lead">Median waiting time · minutes</p>${numberScene('odd',k)}<p class="scene-caption">${['Observed order','Ordered values','The central observation is 4.6 minutes.',math(tex`\mathrm{Median}=4.6\ \text{min}`)][k]}</p>`},
 {title:titleMean,minutes:2,steps:4,render:k=>`<p class="lead">Median waiting time · eight observations</p>${numberScene('even',k)}<p class="scene-caption">${['Keep the ordered values.','Add row 008: 21.0 minutes.','The middle is now between 4.6 and 5.4.',math(tex`\mathrm{Median}=\dfrac{4.6+5.4}{2}=5.0\ \text{min}`)][k]}</p>`},
 {title:titleMean,minutes:2,steps:2,render:k=>`<p class="lead">Sensitivity to an extreme value</p>${extremeBuild(k)}<div class="cols center extreme-results"><div><p class="medium">Mean</p><p class="huge rose" data-count="extreme-mean" data-value="${k?29:6.5}">${k?29:6.5}</p></div><div><p class="medium">Median</p><p class="huge teal">5.0</p></div></div><p class="bottomline">${k?'Only the longest wait changed: 21.0 became 201.0 minutes.':'Mean: 6.5 minutes. Median: 5.0 minutes.'}</p>`},
 {title:titleSpread,minutes:3.5,steps:4,className:'dispersion-slide',render:k=>`<p class="lead">Standard deviation (SD)</p>${k<3?`${dispersionBuild(k)}${k===2?`<div class="sd-formula">${math(tex`\mathrm{SD}=s=\sqrt{\frac{1}{n-1}\sum_{i=1}^{n}(x_i-\bar{x})^2}`,true)}</div><p class="small sd-meaning">Larger SD: more spread.<br>Identical values: ${math(tex`s=0`)}.</p>`:`<p class="scene-caption">Two datasets, eight values each, the same mean: 6.5 minutes.</p>`}`:`<p class="medium">The article reports both centre and dispersion.</p><img class="jama spread-source" src="assets/jama_duration.png" alt="Duration of sore throat, mean (SD), days: 3.86 (1.67) and 3.91 (1.79)."><div class="cols center" style="margin-top:24px"><div><p class="medium">Mean</p><p class="big teal">3.86 days</p></div><div><p class="medium">SD</p><p class="big teal">1.67 days</p></div></div>`}`},
 {title:titleSpread,minutes:3,steps:4,className:'quartile-slide',render:k=>`<p class="lead">Quartiles and interquartile range (IQR)</p>${numberScene('quart',k)}${k<3?`<p class="scene-caption">${['Split the ordered values into two halves.','Apply the same median rule in each half.',math(tex`\mathrm{IQR}=Q_3-Q_1=6.8-3.0=3.8\ \text{min}`)][k]}</p>`:`<div class="jama-note"><img class="jama" src="assets/jama_age.png" alt="Age, median (IQR), years: 33.7 (26.3–45.8), 34.3 (26.0–45.0)."><p class="small">Median: 33.7 years<br>Quartiles: 26.3 and 45.8 years<br>IQR width: 19.5 years</p></div>`}`},
 {title:titleBox,minutes:2.5,steps:5,render:k=>`${numberScene('box',k)}<p class="scene-caption">${['Locate the quartiles and median.','The interquartile range is 3.8 minutes.','Move the observations onto a numerical scale.',`Draw the box from ${math(tex`Q_1`)} to ${math(tex`Q_3`)}.`,'Add the median.'][k]}</p>`},
 {title:titleBox,minutes:2.5,steps:5,render:k=>`${numberScene('tukey',k)}<p class="scene-caption">${[`Limits: ${math(tex`Q_1-1.5\,\mathrm{IQR}`)} and ${math(tex`Q_3+1.5\,\mathrm{IQR}`)}`,math(tex`3.0-1.5\times3.8=-2.7;\qquad6.8+1.5\times3.8=12.5`),'Whiskers reach 1.4 and 7.4 minutes.','All eight observations over the boxplot.','The boxplot retains the point outside the limits.'][k]}</p><p class="scene-sub">${k<2?'The limits are cutoffs, not observed values.':k===2?'21.0 is outside; this does not automatically make it an error.':k===3?'One point is one observation.':'A boxplot describes the distribution of observations.'}</p>`},
 {title:titleHist,minutes:3,steps:4,className:'hist-build-slide',render:k=>`<p class="medium">Sleep last night, in hours · 20 people</p>${histogramBuild(k)}<p class="scene-caption">${['A table of the recorded measurements.','Group the values into 2-hour intervals.','Count the observations in each interval.','The bars display those counts.'][k]}</p>`},
 {title:'Visualising numerical data',minutes:2,steps:2,className:'distribution-comparison',render:k=>`<p class="medium">Same 20 sleep measurements · ${k?4:2}-hour intervals</p>${histogramWithBox(k?4:2)}<p class="scene-caption">The grouping changes. The boxplot stays the same.</p>`},
 {title:'Descriptive statistics: interpretation',minutes:2.5,steps:3,className:'interpretation-slide',render:k=>k===0?`<table class="table summary-table"><thead><tr><th>Variable</th><th>Numerical summaries</th><th>Visualisation</th></tr></thead><tbody><tr><td>Categorical<br><span class="small muted">nominal / ordinal</span></td><td>Counts and percentages</td><td>Bar charts</td></tr><tr><td>Numerical<br><span class="small muted">discrete / continuous</span></td><td>Mean and standard deviation<br>Median and quartiles / IQR</td><td>Points, boxplots, histograms</td></tr></tbody></table><p class="question">What do these summaries tell us?</p>`:`<p class="lead">Read the age summary in the placebo group.</p><img class="jama interpretation-source" src="assets/jama_age.png" alt="Age, median (IQR), years: 33.7 (26.3–45.8), 34.3 (26.0–45.0).">${k===1?'<p class="question">What do the three numbers describe?<br>Are 26.0 and 45.0 the youngest and oldest ages?</p>':`<div class="interpretation-answer"><div><p class="medium">Median</p><p class="big teal">34.3 years</p></div><div><p class="medium">Quartiles · the middle half</p><p class="big teal">26.0–45.0 years</p><p class="iqr-answer">${math(tex`\mathrm{IQR}=45.0-26.0=19.0\ \text{years}`)}</p></div></div>`}`},
 {title:'Comparing numerical data',minutes:3,steps:1,className:'comparison-slide v2-comparison-slide',render:()=>`<p class="medium">Duration of sore throat · days</p><p class="small muted"><strong>Fictional data</strong> · placebo and dexamethasone · two possible observed samples</p>${soreThroatComparison()}<p class="v2-comparison-bottomline">A plot describes the observed groups. It does not establish statistical significance.</p>`},
 {title:'From description to inference',minutes:3,steps:2,className:'inference-slide v2-inference-slide',render:k=>`<img class="conclusion-crop" src="assets/jama_conclusions.png" alt="Original JAMA conclusions, including a significant difference at 48 hours.">${k===0?'<p class="v2-inference-message"><strong>A visual difference is descriptive.</strong><br>It does not establish statistical significance.</p>':'<p class="v2-inference-message"><strong>Inference accounts for sampling variability.</strong></p>'}<p class="bottomline">Next: confidence intervals quantify uncertainty about an estimated difference.</p>`}
];

 
const standaloneVariableTypes=slides.findIndex(s=>s.title==='Types of variables'&&!s.className);
if(standaloneVariableTypes>=0)slides.splice(standaloneVariableTypes,1);

const recordsSlide=slides.find(s=>s.className==='records-slide');
recordsSlide.steps=4;
recordsSlide.minutes=4;
recordsSlide.render=k=>`<p class="medium">Suppose we collect these data from 162 clinic visitors.</p>${k===0?`${fullRecords()}<p class="records-caption">162 people · one table of observations</p>`:recordsTable({types:k>=2,definitions:k>=3})}`;
;

for(const slide of slides){
 if(slide.title==='Measures of centre')slide.title='Numerical summaries: Measures of centre';
 if(slide.title==='Measures of dispersion')slide.title='Numerical summaries: Measures of dispersion';
 if(slide.title==='Visualising numerical data: boxplots')slide.title='Visualisation of numerical data: Boxplot';
}

const inferenceSlide=slides.find(s=>s.className?.includes('inference-slide'));
inferenceSlide.steps=2;
inferenceSlide.className='inference-slide v2-inference-slide';
inferenceSlide.render=k=>`<img class="conclusion-crop" src="assets/jama_conclusions.png" alt="Original JAMA conclusions, including a significant difference at 48 hours.">${k===0?'<p class="v2-inference-message"><strong>This visual difference is descriptive.</strong><br>It does not establish statistical significance.</p>':'<p class="v2-inference-message"><strong>Inference accounts for sampling variability.</strong></p>'}<p class="bottomline">Next: confidence intervals quantify uncertainty about an estimated difference.</p>`;
;

slides.push({title:'Thank you',minutes:0,steps:1,printSteps:[0],className:'thank-you-slide',render:()=>'<p class="thank-you-message">Thank you very much for your attention</p>'});

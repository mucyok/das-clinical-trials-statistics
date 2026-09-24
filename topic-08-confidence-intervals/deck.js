const stage=document.getElementById('stage'),isPrint=new URLSearchParams(location.search).has('print');
let current=0,step=0,simCount=0,simRunning=false,simTimer=null,simGeneration=0,coverageCount=0,linkedConfig=null,approxN=100,approxCount=1000;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function markup(i,k,print=false){const s=slides[i];return `<section class="slide ${s.className||''}" data-slide="${i+1}" data-step="${k}" aria-label="Slide ${i+1}: ${s.title}"><header><h1>${s.title}</h1></header><div class="content">${s.render(k,print)}</div>${print?`<span class="print-state">${i+1}${s.printSteps&&s.printSteps.length>1?' / step '+(k+1):''}${s.optional?' / optional':''}</span>`:''}</section>`;}
function scale(){if(isPrint)return;const s=Math.min(innerWidth/1280,(innerHeight-65)/720);stage.style.transform=`scale(${s})`;stage.style.left=`${(innerWidth-1280*s)/2}px`;stage.style.top=`${Math.max(0,(innerHeight-65-720*s)/2)}px`;}
function stopSimulation(){simRunning=false;clearTimeout(simTimer);simGeneration++;const b=stage.querySelector('[data-action="run"]');if(b)b.textContent='Animate to 1,000';const c=stage.querySelector('[data-coverage-action="run"]');if(c)c.textContent='Animate 50 intervals';const l=stage.querySelector('[data-linked-action="animate"]');if(l)l.textContent='Draw more samples';const a=stage.querySelector('[data-approx-replay]');if(a)a.textContent='Repeat experiment';const s=stage.querySelector('[data-story-run]');if(s)s.textContent=simCount>=1000?'Replay sampling':'Continue sampling';}
function updateStory(count){
  const previous=simCount;simCount=Math.min(1000,count);stage.dataset.simCount=simCount;
  const range=step>=3?[.12,.28]:step>=2?[.16,.24]:null;
  const host=stage.querySelector('[data-counted-plot]');if(!host)return;
  const heights=Object.fromEntries([...host.querySelectorAll('[data-count-bin]')].map(b=>[b.dataset.countBin,+b.getAttribute('height')]));
  host.innerHTML=countedHistogram(simCount,range);
  const context=stage.querySelector('[data-sampling-context]');if(context)context.innerHTML=compactSamplingContext(simCount);
  const summary=range?empiricalWindow(simCount,...range):null;
  stage.querySelector('[data-counted-readout]').textContent=summary?`${summary.hits} / ${simCount.toLocaleString('en')} estimates between ${pct(range[0])} and ${pct(range[1])} (${(100*summary.fraction).toFixed(1)}%)`:`${simCount.toLocaleString('en')} samples, ${simCount.toLocaleString('en')} estimates`;
  if(!reduced()&&simCount>previous)host.querySelectorAll('[data-count-bin]').forEach(b=>{const h=+b.getAttribute('height'),before=heights[b.dataset.countBin]||0;if(h>before){const baseline=host.querySelector('[data-histogram-baseline]')?.dataset.histogramBaseline||275;b.style.transformOrigin=`${b.getAttribute('x')}px ${baseline}px`;b.animate([{transform:`scaleY(${before/h})`},{transform:'scaleY(1)'}],{duration:240,easing:'ease-out'});}});
}
function runStory(){
  if(simRunning){stopSimulation();return;}if(simCount>=1000)updateStory(3);
  simRunning=true;const token=++simGeneration;stage.querySelector('[data-story-run]').textContent='Pause';
  function tick(){if(!simRunning||token!==simGeneration)return;updateStory(simCount+(reduced()?1000:simCount<6?1:simCount<30?3:50));if(simCount>=1000){stopSimulation();return;}simTimer=setTimeout(tick,simCount<6?800:simCount<30?250:180);}tick();
}
function drawNormal(){const p=stage.querySelector('[data-normal]');if(!p||reduced())return;const len=p.getTotalLength();p.animate([{strokeDasharray:`${len} ${len}`,strokeDashoffset:len},{strokeDasharray:`${len} ${len}`,strokeDashoffset:0}],{duration:1150,easing:'ease-in-out'});}
function updateSim(count,flight=false){
  const previous=simCount,oldBars={};stage.querySelectorAll('[data-bin]').forEach(e=>oldBars[e.dataset.bin]=+e.getAttribute('height'));
  simCount=Math.min(1000,count);const d=draws[Math.max(0,simCount-1)];
  stage.querySelector('[data-sim-dots]').innerHTML=dots(d.data,340,88,20);
  stage.querySelector('[data-sim-readout]').innerHTML=`${simCount?'Sample '+simCount:'First sample, ready to add'}<br><span class="teal">${d.cases} / 100 = ${pct(d.estimate)}</span>`;
  stage.querySelector('[data-sim-plot]').innerHTML=histogram(simCount,step>=2);
  stage.querySelector('[data-sim-count]').textContent=`${simCount.toLocaleString('en')} / 1,000 samples`;
  stage.dataset.simCount=simCount;
  for(const name of ['one','finish','run'])stage.querySelector(`[data-action="${name}"]`).disabled=simCount===1000;
  if(flight&&!reduced()){
    const base=stage.querySelector('[data-flight]');
    draws.slice(previous,simCount).forEach((sample,i)=>{
      const dot=i?base.cloneNode(false):base;if(i){dot.removeAttribute('data-flight');dot.setAttribute('data-flight-clone','');base.parentNode.appendChild(dot);}
      const x=110+sample.estimate/.4*985,bar=stage.querySelector(`[data-bin="${sample.cases}"]`),y=+bar.getAttribute('y')-9;
      dot.setAttribute('cx',x);dot.setAttribute('cy',y);
      const a=dot.animate([{opacity:1,transform:`translate(0px,${35-y}px)`},{opacity:1,transform:'translate(0px,0px)',offset:.87},{opacity:0,transform:'translate(0px,0px)'}],{duration:350,delay:i%6*10,easing:'ease-in'});if(i)a.onfinish=()=>dot.remove();
    });
    stage.querySelectorAll('[data-bin]').forEach(e=>{const before=oldBars[e.dataset.bin]||0,after=+e.getAttribute('height');if(after>before){e.style.transformOrigin=`${e.getAttribute('x')}px 245px`;e.animate([{transform:`scaleY(${before/after})`,opacity:1},{transform:'scaleY(1)',opacity:.75}],{delay:320,duration:160,fill:'backwards',easing:'ease-out'});}});
    if(simCount-previous===1){const plus=stage.querySelector('[data-increment]'),bar=stage.querySelector(`[data-bin="${d.cases}"]`);plus.setAttribute('x',110+d.estimate/.4*985);plus.setAttribute('y',Math.max(45,+bar.getAttribute('y')-24));plus.animate([{opacity:0},{opacity:1,offset:.35},{opacity:1,offset:.8},{opacity:0}],{duration:850});}
  }
}
function runSimulation(){
  if(simRunning){stopSimulation();return;}if(simCount>=1000)return;
  simRunning=true;const token=++simGeneration;stage.querySelector('[data-action="run"]').textContent='Pause';
  function tick(){if(!simRunning||token!==simGeneration)return;const batch=reduced()?1000:simCount<6?1:simCount<30?3:25;updateSim(simCount+batch,true);if(simCount>=1000){if(reduced())show(current,2);else simTimer=setTimeout(()=>{if(token===simGeneration)show(current,2);},550);return;}simTimer=setTimeout(tick,simCount<6?1050:520);}tick();
}
function updateCoverage(count){
  coverageCount=count;stage.dataset.coverageCount=count;
  stage.querySelector('[data-coverage-plot]').innerHTML=coveragePlot(count);
  const n=count>=1000?1000:Math.min(50,count),hits=intervals.slice(0,n).filter(d=>d.covers).length;
  stage.querySelector('[data-coverage-count]').textContent=`${hits} / ${n} contain p${n===1000?' ('+(coverage/10).toFixed(1)+'%)':''}`;
}
function runCoverage(){if(simRunning){stopSimulation();return;}if(coverageCount>=50){show(current,0,false);}simRunning=true;const token=++simGeneration;stage.querySelector('[data-coverage-action="run"]').textContent='Pause';function tick(){if(!simRunning||token!==simGeneration)return;updateCoverage(reduced()?50:coverageCount+1);if(coverageCount>=50){stopSimulation();return;}simTimer=setTimeout(tick,coverageCount<6?550:100);}tick();}

function animateArea(area,from){
  const target=[+area.dataset.lo,+area.dataset.hi],start=performance.now(),labels=[...stage.querySelectorAll('[data-area-label],[data-area-caption]')];
  labels.forEach(e=>e.style.visibility='hidden');
  function frame(now){if(!area.isConnected)return;const t=Math.min(1,(now-start)/850),ease=t*t*(3-2*t),bounds=from.map((v,i)=>v+(target[i]-v)*ease);area.setAttribute('d',areaPath(...bounds));area.dataset.lo=bounds[0];area.dataset.hi=bounds[1];stage.querySelectorAll('[data-area-bound]').forEach(el=>{const z=bounds[+el.dataset.areaBound];el.setAttribute('x1',NX(z));el.setAttribute('x2',NX(z));el.setAttribute('y1',NY(z));});if(t<1)requestAnimationFrame(frame);else labels.forEach(e=>e.style.visibility='visible');}requestAnimationFrame(frame);
}
function animateTransform(from,to,region){
  const host=stage.querySelector('[data-transform-host]');if(!host||from===to)return;
  const start=performance.now(),duration=Math.max(from,to)>1?2800:1900;
  function frame(now){if(!host.isConnected)return;const t=Math.min(1,(now-start)/duration),ease=t*t*(3-2*t);host.innerHTML=standardPlot(from+(to-from)*ease,region);if(t<1)requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
}
function bindApproximation(){
  const size=stage.querySelector('[data-approx-size]'),button=stage.querySelector('[data-approx-replay]');if(!size)return;
  size.onchange=e=>{stopSimulation();approxN=+e.target.value;approxCount=1000;renderApproximation(true);};
  button.textContent=simRunning?'Pause':'Repeat experiment';button.onclick=()=>{
    if(simRunning){stopSimulation();return;}
    if(approxCount>=1000)approxCount=0;
    simRunning=true;const token=++simGeneration;
    const tick=()=>{if(token!==simGeneration||!simRunning)return;approxCount=Math.min(1000,approxCount+(reduced()?1000:50));renderApproximation(true);if(approxCount>=1000){stopSimulation();return;}simTimer=setTimeout(tick,220);};tick();
  };
}
function animateApproximation(fromN,toN){
  if(fromN===toN)return;
  const curve=stage.querySelector('[data-approx-curve]'),host=stage.querySelector('[data-approx-host]');if(!curve)return;
  const start=performance.now(),a=Math.sqrt(.16/fromN),b=Math.sqrt(.16/toN);
  host.querySelectorAll('rect').forEach(e=>e.animate([{opacity:0},{opacity:.32}],{duration:1100}));
  function frame(now){if(!curve.isConnected)return;const t=Math.min(1,(now-start)/1300),e=t*t*(3-2*t),sd=a*Math.pow(b/a,e);curve.dataset.morphSd=sd;curve.setAttribute('d',pathCurve(x=>100+x/.6*980,d=>310-d/24*236,0,.6,P,sd));if(t<1)requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
}
function histogramToArea(){
  const chart=stage.querySelector('.probability-slide .chart'),area=chart?.querySelector('[data-normal-area]');if(!area)return;
  const holder=document.createElement('div');holder.innerHTML=bell({hist:true});const bars=[...holder.querySelectorAll('rect')];
  bars.forEach(b=>chart.insertBefore(b,chart.firstChild));area.animate([{opacity:0},{opacity:.2}],{duration:1500});
  for(const bar of bars){const animation=bar.animate([{opacity:.3},{opacity:.3,offset:.3},{opacity:0}],{duration:1500,fill:'forwards'});animation.onfinish=()=>bar.remove();}
}
function renderApproximation(animate=false){
  const fromN=+(stage.querySelector('[data-approx-n]')?.dataset.approxN||approxN),content=stage.querySelector('.content');
  content.innerHTML=approximationScene(approxN,approxCount)+`<p class="bottomline" data-area-caption>${approximationCaption(approxN)}</p>`;bindApproximation();
  if(animate&&!reduced())animateApproximation(fromN,approxN);
}
function growObservedInterval(){
  const bar=stage.querySelector('[data-ci-whisker]'),point=stage.querySelector('[data-ci-point]');if(!bar||!point)return;
  const centre=+point.getAttribute('cx'),ends=[+bar.getAttribute('x1'),+bar.getAttribute('x2')],caps=[...stage.querySelectorAll('[data-ci-cap]')],labels=[...stage.querySelectorAll('[data-ci-end-label]')],start=performance.now();
  labels.forEach(e=>e.style.visibility='hidden');
  function frame(now){if(!bar.isConnected)return;const t=Math.min(1,(now-start)/1400),ease=t*t*(3-2*t);ends.forEach((end,i)=>{const x=centre+(end-centre)*ease;bar.setAttribute('x'+(i+1),x);caps[i].setAttribute('x1',x);caps[i].setAttribute('x2',x);});if(t<1)requestAnimationFrame(frame);else labels.forEach(e=>e.style.visibility='visible');}
  requestAnimationFrame(frame);
}
function linkedSnapshot(){return Object.fromEntries([...stage.querySelectorAll('[data-interval]')].map(el=>{const w=el.querySelector('[data-whisker]');return [el.dataset.interval,{transform:getComputedStyle(el).transform,lo:w?+w.getAttribute('x1'):0,hi:w?+w.getAttribute('x2'):0}];}));}
function animateLinked(old){
  const start=performance.now(),whiskers=[],duration=simRunning?(linkedConfig.total<=5?1000:linkedConfig.total<=50?500:180):1100;
  stage.querySelectorAll('[data-interval]').forEach(el=>{
    const prev=old[el.dataset.interval],d=ensemble(linkedConfig.n)[+el.dataset.interval];
    const from=prev?.transform||`translate(${100+d.estimate/.6*960}px,319px)`;
    if(from!==el.style.transform)el.animate([{transform:from},{transform:el.style.transform}],{duration,easing:'ease-in-out'});
    const w=el.querySelector('[data-whisker]');if(w){const lo=+w.getAttribute('x1'),hi=+w.getAttribute('x2');whiskers.push({w,lo,hi,fromLo:prev?.lo||0,fromHi:prev?.hi||0});}
  });
  function frame(now){const t=Math.min(1,(now-start)/duration),e=t*t*(3-2*t);for(const {w,lo,hi,fromLo,fromHi} of whiskers)if(w.isConnected){w.setAttribute('x1',fromLo+(lo-fromLo)*e);w.setAttribute('x2',fromHi+(hi-fromHi)*e);}if(t<1)requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
}
function bindLinked(){
  stage.dataset.coverageCount=linkedConfig.total;stage.dataset.coverageN=linkedConfig.n;stage.dataset.coverageLevel=linkedConfig.level;
  const run=stage.querySelector('[data-linked-action="animate"]');run.textContent=simRunning?'Pause':'Draw more samples';run.onclick=runLinked;
  stage.querySelector('[data-linked-action="all"]').onclick=()=>{stopSimulation();updateLinked({...linkedConfig,total:1000,windowStart:0});};
  stage.querySelector('[data-linked-action="window"]').onclick=()=>{stopSimulation();updateLinked({...linkedConfig,windowStart:((linkedConfig.windowStart||0)+50)%Math.max(50,linkedConfig.total)},false);};
  stage.querySelector('[data-coverage-n]').onchange=e=>{stopSimulation();updateLinked({...linkedConfig,n:+e.target.value,total:1000,phase:2});};
  stage.querySelector('[data-coverage-level]').onchange=e=>{stopSimulation();updateLinked({...linkedConfig,level:+e.target.value});};
}
function updateLinked(config,animate=true){
  const old=linkedSnapshot();linkedConfig={...config};stage.querySelector('.content').innerHTML=linkedCoverageScene(linkedConfig);bindLinked();
  if(animate&&!reduced())animateLinked(old);
}
function runLinked(){
  if(simRunning){stopSimulation();return;}
  const phase=linkedConfig.phase===2?2:0;
  if(linkedConfig.total>=1000)updateLinked({...linkedConfig,total:0,phase,windowStart:0},false);
  simRunning=true;const token=++simGeneration;
  function tick(){if(!simRunning||token!==simGeneration)return;const count=linkedConfig.total,batch=reduced()?1000:count<5?1:count<50?5:10,total=Math.min(1000,count+batch);
    updateLinked({...linkedConfig,total,phase,windowStart:phase===2?Math.max(0,total-50):0});
    if(linkedConfig.total>=1000){stopSimulation();return;}simTimer=setTimeout(tick,count<5?1300:count<50?650:220);
  }tick();
}
function bindTails(){
  stage.querySelectorAll('[data-tail-mode]').forEach(b=>b.onclick=()=>{
    const mode=b.dataset.tailMode;stage.querySelector('[data-tails-plot]').innerHTML=tailsPicture(mode);
    stage.querySelector('.alpha-caption').innerHTML=math(mode==='two'?tex`1-\alpha/2=0.975\qquad z_{1-\alpha/2}\approx1.96`:mode==='lower'?tex`\text{Lower bound: }\widehat p-z_{0.95}\widehat{\mathrm{SE}}`:tex`\text{Upper bound: }\widehat p+z_{0.95}\widehat{\mathrm{SE}}`);
    stage.querySelector('.bottomline').textContent=mode==='two'?'Two-sided 95%: α = 5%, split into 2.5% in each tail.':'One-sided 95%: α = 5% in one tail, so z₀.₉₅ ≈ 1.645.';
    stage.querySelectorAll('[data-tail-mode]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));
  });
}
function show(i,k=0,animate=true){
  const v4Before=v4AreaSnapshot();
  stopSimulation();const oldApproxN=+(stage.querySelector('[data-approx-n]')?.dataset.approxN||0),old={},oldLinked=linkedSnapshot(),oldTransform=stage.querySelector('[data-transform-phase]');const transformFrom=oldTransform?+oldTransform.dataset.transformPhase:null;stage.querySelectorAll('[data-key]').forEach(e=>old[e.dataset.key]={transform:e.style.transform,html:e.innerHTML});
  const oldArea=stage.querySelector('[data-normal-area]'),areaFrom=oldArea?[+oldArea.dataset.lo,+oldArea.dataset.hi]:null,previous=current,previousStep=step;
  current=Math.max(0,Math.min(slides.length-1,i));step=Math.max(0,Math.min(slides[current].steps-1,k));stage.innerHTML=markup(current,step);delete stage.dataset.simCount;delete stage.dataset.coverageCount;
  if(animate&&!reduced()){
    stage.querySelectorAll('[data-key]:not([data-interval])').forEach(e=>{const prev=old[e.dataset.key];if(prev&&prev.transform!==e.style.transform)e.animate([{transform:prev.transform},{transform:e.style.transform}],{duration:slides[current].sampling?2100:700,easing:'ease-in-out'});});
    if(previous===current&&slides[current].title==='Another sample')stage.querySelectorAll('g[data-key]').forEach((e,i)=>e.animate([{transform:`translate(570px,${i%10*25}px)`,opacity:0},{transform:e.style.transform,opacity:1}],{duration:600,delay:i%10*15,easing:'ease-out'}));
    stage.querySelectorAll('[data-origin]').forEach((e,i)=>{if(!old[e.dataset.key]){const [x,y]=e.dataset.origin.split(',');e.animate([{transform:`translate(${x}px,${y}px)`},{transform:e.style.transform}],{duration:slides[current].sampling?2100:1050,delay:e.hasAttribute('data-grid-sample')?0:i%10*12,easing:'ease-in-out'});}});
    if(previous===current)animateV4(v4Before);
    const area=stage.querySelector('[data-normal-area]');if(area&&areaFrom&&current===previous)animateArea(area,areaFrom);
    if(slides[current].transform&&previous===current&&transformFrom!==null)animateTransform(transformFrom,slides[current].transformPhases?.[step]??(slides[current].inverse?2-step:step),!!slides[current].inverse);
    if(slides[current].className==='interval-slide'&&previous===current&&previousStep===0&&step===1)growObservedInterval();
  }
  document.getElementById('position').textContent=`${current+1} / ${slides.length} · ${step+1}/${slides[current].steps}`;
  document.getElementById('prev').disabled=current===0&&step===0;document.getElementById('next').disabled=current===slides.length-1&&step===slides[current].steps-1;
  if(slides[current].simulation){simCount=step?1000:0;updateSim(simCount);stage.querySelector('[data-action="one"]').onclick=()=>{stopSimulation();updateSim(simCount+1,true);};stage.querySelector('[data-action="run"]').onclick=runSimulation;stage.querySelector('[data-action="finish"]').onclick=()=>show(current,2);if(animate&&step>=2&&(previous!==current||previousStep<2))drawNormal();}
  if(slides[current].coverage){coverageCount=[0,50,1000][step];stage.dataset.coverageCount=coverageCount;stage.querySelector('[data-coverage-action="run"]').onclick=runCoverage;stage.querySelector('[data-coverage-action="finish"]').onclick=()=>show(current,2);}
  if(slides[current].linkedCoverage){linkedConfig={...coverageBuilds[step]};bindLinked();if(animate&&!reduced()&&previous===current)animateLinked(oldLinked);}
  if(slides[current].storyHistogram){
    simCount=step?1000:3;stage.dataset.simCount=simCount;
    stage.querySelector('[data-story-run]').onclick=runStory;
    stage.querySelector('[data-story-all]').onclick=()=>{stopSimulation();updateStory(1000);};
    if(animate&&previous===current&&previousStep===0&&step===1){updateStory(3);runStory();}
  }
  if(slides[current].sizeComparison&&animate&&!reduced()&&previous===current){
    if(step<3)stage.querySelectorAll('.size-row').item(step)?.animate([{opacity:0},{opacity:1}],{duration:650});
    else stage.querySelectorAll('[data-size-normal]').forEach(p=>{const len=p.getTotalLength();p.animate([{strokeDasharray:`${len} ${len}`,strokeDashoffset:len},{strokeDasharray:`${len} ${len}`,strokeDashoffset:0}],{duration:1100,easing:'ease-in-out'});});
  }
  if(slides[current].tails)bindTails();
  if(slides[current].approximation){
    if(step<3){approxN=[25,100,400][step];approxCount=1000;bindApproximation();if(animate&&!reduced()&&oldApproxN&&previous===current)animateApproximation(oldApproxN,approxN);}
    else if(step===3&&animate&&!reduced()&&previous===current&&previousStep<3)histogramToArea();
  }
  history.replaceState(null,'',`#${current+1}.${step}`);scale();
}
function next(){if(step<slides[current].steps-1)show(current,step+1);else if(current<slides.length-1)show(current+1);}
function prev(){if(step>0)show(current,step-1);else if(current>0)show(current-1,slides[current-1].steps-1);}
function toggle(id,button){const a=document.getElementById(id);a.hidden=!a.hidden;document.getElementById(button).setAttribute('aria-expanded',!a.hidden);}
window.showSlide=(i,k=0)=>show(i,k,false);window.slideMarkup=markup;
window.setSimulationCount=count=>{stopSimulation();updateSim(count);};
window.setCoverageConfig=config=>{stopSimulation();updateLinked({...linkedConfig,...config},false);};
window.printPlan=slides.flatMap((s,i)=>(s.printSteps||[s.steps-1]).map(k=>({i,k})));
if(isPrint){document.body.classList.add('print-mode');stage.innerHTML=printPlan.map(({i,k})=>markup(i,k,true)).join('');}
else{
  const [i,k]=location.hash.slice(1).split('.').map(Number);show((i||1)-1,k||0,false);
  document.getElementById('prev').onclick=prev;document.getElementById('next').onclick=next;
  document.getElementById('overviewButton').onclick=()=>toggle('overview','overviewButton');document.getElementById('fullButton').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
  document.getElementById('overview').innerHTML='<h2>Slides</h2>'+slides.map((s,i)=>`<button data-goto="${i}">${i+1}. ${s.title}</button>`).join('');
  document.getElementById('overview').onclick=e=>{const b=e.target.closest('[data-goto]');if(b){show(+b.dataset.goto);toggle('overview','overviewButton');}};
  addEventListener('resize',scale);addEventListener('keydown',e=>{if(e.target.closest('button')&&[' ','Enter'].includes(e.key))return;if(['ArrowRight','ArrowDown',' ','PageDown'].includes(e.key)){e.preventDefault();next();}else if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();prev();}else if(e.key==='Home')show(0);else if(e.key==='End')show(slides.length-1,slides.at(-1).steps-1);else if(e.key==='Escape'){document.getElementById('overview').hidden=true;document.getElementById('overviewButton').setAttribute('aria-expanded',false);}});
}

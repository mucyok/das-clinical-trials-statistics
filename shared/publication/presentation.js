 
(() => {
 const path=location.pathname;
 const topic=path.includes('topic-07')?7:path.includes('topic-08')?8:path.includes('topic-09')?9:10;
 const first=slides[0],previousTitle=first.render;
 first.render=(...args)=>previousTitle(...args)
  .replace('<p class="course">DAS · Statistics</p>',`<p class="course">DAS in Management of Clinical Trials</p><p class="module">Module 2 · Principles and Methods of Clinical Research</p><p class="topic">Topic ${topic}</p>`)
  .replace('<div class="route">','<p class="authors">Mucyo Karemera · Stéphane Guerrier</p><div class="route">');
 if(topic===8){
  function sampleFirst(k,infer=false){
   let b=txt(95,266,'Sample',31)+`<rect x="95" y="280" width="300" height="122" rx="4" fill="none" stroke="${C.line}" stroke-width="2"/>`;
   for(let i=0;i<18;i++)b+=`<circle cx="${122+(i%9)*31}" cy="${316+Math.floor(i/9)*46}" r="8" fill="${i%4===0?C.teal:C.pale}"/>`;
   b+=arrow(420,341,550,341)+txt(585,313,'Describe what we observed',29,C.teal)+txt(585,359,'Means, proportions, graphs',25,C.muted);
   if(k>=1||infer){
    b+=txt(30,32,'Population',31)+`<rect x="30" y="48" width="430" height="143" rx="4" fill="none" stroke="${C.line}" stroke-width="2"/>`;
    for(let i=0;i<60;i++)b+=`<circle cx="${51+(i%12)*35}" cy="${67+Math.floor(i/12)*26}" r="6.5" fill="${i%7===0?C.teal:C.pale}"/>`;
    b+=arrow(245,201,245,248)+txt(279,232,'Sampling',23,C.teal);
    b+=txt(585,79,'The population we want to learn about',29)+txt(585,121,'Beyond the people in our sample',25,C.muted);
   }
   if(infer&&k>=1)b+=arrow(895,274,895,163,C.rose)+txt(931,219,'Infer',25,C.rose);
   return svg(b,1152,420,'Start with the observed sample and its summaries, then reveal the population from which the sample comes and the direction of inference');
  }
  Object.assign(slides[1],{title:'From our sample to the population',steps:3,printSteps:[0,1,2],className:'inference-opening',render:k=>`<p class="lead">We have described the data in our sample.</p>${sampleFirst(k)}<p class="bottomline">${['These summaries tell us what happened in the sample.','Our sample comes from a wider population.','What can our sample tell us about that population?'][k]}</p>`});
  Object.assign(slides[2],{className:'inference-opening',printSteps:[0,2],render:k=>`<p class="lead">Statistical inference connects the sample to the population.</p>${sampleFirst(k,true)}<p class="bottomline">${['A treatment seems to help the patients we studied.','Would it also help other comparable patients?','We estimate population quantities and express our uncertainty.'][k]}</p>`});
 }
})();

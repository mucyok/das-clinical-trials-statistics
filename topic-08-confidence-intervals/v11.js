 
const v11CoverageScene=linkedCoverageScene;
linkedCoverageScene=config=>v11CoverageScene(config)
 .replace(/<option value="1600"[^>]*>1600<\/option>/,'')
 .replace(/<option value="80"[^>]*>80%<\/option>/,'');

const v11Coverage=slides.find(s=>s.title==='Confidence intervals in repeated samples');
;
;
;

const v11PlanningIndex=slides.findIndex(s=>s.title==='Planning a sample size');
if(v11PlanningIndex>=0)slides.splice(v11PlanningIndex,1);

const v11Mean=slides.find(s=>s.title==='Confidence intervals for a population mean');
;

Object.assign(window.DECK,{slides,coverageBuilds});

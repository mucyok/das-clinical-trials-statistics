 
const v8CoverageScene=linkedCoverageScene;
linkedCoverageScene=config=>v8CoverageScene(config).replace('Nominal confidence <select','Confidence level <select').replace(`Approximate normal intervals. The observed fraction can differ from ${config.level}%.`,`Approximate coverage. The observed fraction can differ from ${config.level}%. Arrows mark off-scale ends.`);
;
;
Object.assign(window.DECK,{slides});

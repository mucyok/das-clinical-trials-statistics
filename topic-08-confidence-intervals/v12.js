 
const v12QuantileSlide=slides.find(s=>s.title==='Standard Normal quantiles');
const v12QuantileRender=v12QuantileSlide.render;
v12QuantileSlide.render=k=>v12QuantileRender(k).replace(
 'The quantile zq is its cutoff on the horizontal axis.',
 `The quantile ${math(tex`z_q`)} is its cutoff on the horizontal axis.`
);

slides.push({title:'Thank you',minutes:0,steps:1,printSteps:[0],className:'thank-you-slide',render:()=>'<p class="thank-you-message">Thank you very much for your attention</p>'});

Object.assign(window.DECK,{slides,coverageBuilds});

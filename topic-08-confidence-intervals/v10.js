 
const v10Theorem=slides[9].render;
slides[9].render=k=>v10Theorem(k)
 .replace(
  math(tex`\mathrm{SE}(\widehat p)=\mathrm{SD}(\widehat p)=\sqrt{\frac{p(1-p)}n}`,true),
  math(tex`\mathrm{SE}=\sqrt{\frac{p(1-p)}n}`,true)
 )
 .replace(`SE of ${math(tex`\widehat p`)}`,'SE');
;

const v10Planning=slides[18].render;
slides[18].render=k=>v10Planning(k).replace('<br>If no planning estimate is available, use p = 50% for the largest variance.','');
;

const v10Closing=slides[20].render;
slides[20].render=k=>v10Closing(k).replace('What if we want to test whether the true prevalence equals a given value?','What if we want to test a guess on the true prevalence?');

Object.assign(window.DECK,{slides});

 
(() => {
 const greek={α:'alpha',β:'beta',γ:'gamma',δ:'delta',ε:'varepsilon',θ:'theta',μ:'mu',σ:'sigma',π:'pi',Σ:'Sigma',Φ:'Phi'};
 const atom='(?:H[₀₁₂012]|[A-Za-z]+[₀₁₂₃₄₅₆₇₈₉][₀₁₂₃₄₅₆₇₈₉.]*|p̂|[imnpqEsxzNXZ](?:_[a-z0-9]+)?|[αβγδεθμσπΣΦ])';
 const number='(?:[−+-]?(?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d+)?%?)';
 const unit=`(?:${atom}|${number})`;
 const pattern=new RegExp(`(?<![\\p{L}\\p{N}_])(?:${unit}(?:\\s*[=<>≤≥≈±×−+*/-]\\s*${unit})+|[−±≈≤≥<>]\\s*${number}|${atom})(?![\\p{L}\\p{N}_])|\\[[^\\[\\]\\n]*\\d[^\\[\\]\\n]*\\]|${number}|[\\[\\]]`,'gu');
 const toTex=s=>s.replace(/H([₀₁₂012])/g,(_,i)=>'H_'+({'₀':'0','₁':'1','₂':'2'}[i]||i))
  .replace(/([A-Za-z]+)([₀₁₂₃₄₅₆₇₈₉][₀₁₂₃₄₅₆₇₈₉.]*)/g,(_,base,sub)=>(base.length>1?'\\mathrm{'+base+'}':base)+'_{'+sub.replace(/[₀₁₂₃₄₅₆₇₈₉]/g,c=>'₀₁₂₃₄₅₆₇₈₉'.indexOf(c))+'}')
  .replace(/p̂/g,'\\widehat p').replace(/[αβγδεθμσπΣΦ]/g,c=>'\\'+greek[c]+' ')
  .replace(/≤/g,'\\le ').replace(/≥/g,'\\ge ').replace(/≈/g,'\\approx ').replace(/±/g,'\\pm ').replace(/×/g,'\\times ').replace(/−/g,'-').replace(/%/g,'\\%')
  .replace(/(\d),(?=\d{3}(?:\D|$))/g,'$1{,}');
 const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const cache=new Map(),widths=new Map();
 function converted(s){
  if(cache.has(s))return cache.get(s);
  let out='',last=0,found=false;
  for(const m of s.matchAll(pattern)){
   found=true;const latex=toTex(m[0]);
   out+=esc(s.slice(last,m.index))+`<span class="authored-latex">${katex.renderToString(latex,{throwOnError:true,strict:'error',trust:false})}</span>`;
   last=m.index+m[0].length;
  }
  const result=found?out+esc(s.slice(last)):null;cache.set(s,result);return result;
 }
 function italicMath(root){
  for(const e of root.querySelectorAll('.katex-html span'))if(!e.children.length&&/[\d\[\]]/.test(e.textContent)){
   e.classList.add('slide-number');if(/^[\[\]]$/.test(e.textContent))e.classList.add('slide-interval-bracket');
  }
 }
 function measure(html,size){
  const key=size+'|'+html;if(widths.has(key))return widths.get(key);
  const p=document.createElement('span');p.style.cssText=`position:fixed;visibility:hidden;white-space:nowrap;font-size:${size}px;line-height:1.4;`;
  p.innerHTML=html;italicMath(p);document.body.append(p);const width=Math.ceil(p.getBoundingClientRect().width)+8;p.remove();widths.set(key,width);return width;
 }
 function setLabel(f,source){
  const html=converted(source)??esc(source),size=+f.dataset.latexSize,width=measure(html,size),x=+f.dataset.latexX,anchor=f.dataset.latexAnchor;
  f.setAttribute('width',width);f.setAttribute('x',x-(anchor==='middle'?width/2:anchor==='end'?width:0));
  f.dataset.latexSource=source;
  const d=document.createElementNS('http://www.w3.org/1999/xhtml','div');
  d.style.cssText=`font-size:${size}px;line-height:1.4;white-space:nowrap;color:${f.dataset.latexColor};font-family:${f.dataset.latexFamily};font-weight:${f.dataset.latexWeight};`;
  d.innerHTML=html;italicMath(d);f.replaceChildren(d);
 }
 function render(root){
  if(!root)return;
  for(const t of [...root.querySelectorAll('svg text')]){
   if(t.closest('.katex')||converted(t.textContent)===null)continue;
   const css=getComputedStyle(t),size=parseFloat(css.fontSize)||parseFloat(t.style.fontSize)||24,anchor=t.getAttribute('text-anchor')||css.textAnchor||'start';
   const x=+(t.getAttribute('x')||0),y=+(t.getAttribute('y')||0),central=['central','middle'].includes(t.getAttribute('dominant-baseline')||css.dominantBaseline);
   const f=document.createElementNS('http://www.w3.org/2000/svg','foreignObject');
   for(const a of [...t.attributes])if(/^(data-|id$|transform$)/.test(a.name))f.setAttribute(a.name,a.value);
   Object.assign(f.dataset,{latexSize:size,latexX:x,latexAnchor:anchor,latexColor:css.fill||t.style.fill||'#22383c',latexFamily:css.fontFamily||'inherit',latexWeight:css.fontWeight||'400'});
   f.setAttribute('y',y-size*(central?.7:1.04));f.setAttribute('height',size*2.2);
   f.style.opacity=css.opacity;f.style.visibility=css.visibility;if(t.style.transform)f.style.transform=t.style.transform;
   setLabel(f,t.textContent);t.replaceWith(f);
  }
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(w.nextNode())nodes.push(w.currentNode);
  for(const n of nodes){
   if(!n.parentElement||n.parentElement.closest('.katex,svg text,script,style,select,option,[data-latex-source]'))continue;
   const content=converted(n.textContent);if(content===null)continue;
   const t=document.createElement('template');t.innerHTML=content;n.replaceWith(t.content);
  }
  italicMath(root);
 }
 window.renderLatexContent=render;
 window.updateLatexLabel=(el,value)=>{if(el.matches('foreignObject[data-latex-source]'))setLabel(el,String(value));else{el.textContent=String(value);render(el);}};
 const stage=document.getElementById('stage'),observer=new MutationObserver(()=>{observer.disconnect();render(stage);observer.observe(stage,{childList:true,subtree:true,characterData:true});});
 observer.observe(stage,{childList:true,subtree:true,characterData:true});
 function refresh(){widths.clear();for(const f of document.querySelectorAll('foreignObject[data-latex-source]'))setLabel(f,f.dataset.latexSource);}
 document.fonts.ready.then(refresh);document.fonts.addEventListener('loadingdone',refresh);
})();

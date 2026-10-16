/*
 * Copyright (c) 2026 Yuli Liu — YAO LAB / 爻间.
 * Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
 * Classical text content and third-party materials have separate terms.
 */
/* YAO LAB — bounded 6-bit exploration; never mutates the actual cast. */
(()=>{
 'use strict';
 const core=window.YaoLabCore;
 if(!core) throw new Error('YaoLabCore must load before hex-lab.js');
 const box=document.getElementById('result-line-svg');
 const footer=document.getElementById('result-binary');
 const panel=document.querySelector('.result-cover-right');
 let base='',experiment='',lastCastId='';
 const EN=()=>window.YaoI18n?.english?.()===true;
 const t=(a,b)=>EN()?b:a;
 const H=(bits)=>core.byBits.get(bits);
 const hname=(bits)=>{
   const h=H(bits);return h?(EN()?window.YaoEnReading.hex(h.num):h.name):'—';
 };
 const metric=document.createElement('div');metric.className='hexexp-metrics';metric.id='hexexp-metrics';metric.setAttribute('aria-live','polite');
 const controls=document.createElement('div');controls.className='hexexp-actions';controls.innerHTML='<button id="hexexp-step" type="button"></button><button id="hexexp-reset" type="button"></button>';
 const compass=document.createElement('div');compass.className='hexexp-compass';compass.id='hexexp-compass';compass.setAttribute('aria-label','Six neighboring states / 六个一爻邻接态');
 const note=document.createElement('p');note.className='hexexp-note';note.id='hexexp-note';
 panel.insertBefore(compass,footer.nextSibling);
 panel.insertBefore(metric,compass.nextSibling);
 panel.insertBefore(controls,metric.nextSibling);
 panel.insertBefore(note,controls.nextSibling);
 let step=0;
 function bitsFlip(bits,i){return bits.slice(0,i)+(bits[i]==='1'?'0':'1')+bits.slice(i+1);}
 function countDifferences(a,b){return [...a].reduce((n,x,i)=>n+(x!==b[i]),0);}
 function render(){
   const actual=core.getCurrent();
   const k=countDifferences(base,experiment);
   const h=H(experiment);if(!h)return;
   document.querySelector('.result-cover-right>span').textContent=t('HEXAGRAM / 六位状态实验','HEXAGRAM / SIX-BIT EXPERIMENT');
   box.setAttribute('role','group');box.setAttribute('aria-label',t('从上向下显示六爻，点击单独翻转；不会更改真实起卦','Six clickable lines, top to bottom. This does not change the actual cast.'));
   box.innerHTML=[5,4,3,2,1,0].map(i=>{
     const b=experiment[i],changed=b!==base[i];
     return `<button type="button" class="hexexp-line ${changed?'is-flipped':''} ${actual.moving.includes(i+1)?'was-moving':''}" data-line-index="${i}" aria-pressed="${changed}" aria-label="${t('翻转第','Flip line ')}${i+1}${t('爻','')}: ${b==='1'?t('阳','yang'):t('阴','yin')}"><span class="hexexp-index">${String(i+1).padStart(2,'0')}</span><span class="hexexp-bars ${b==='1'?'solid':'broken'}"><i></i>${b==='0'?'<i></i>':''}</span><span class="hexexp-indicator">${changed?'✦':actual.moving.includes(i+1)?'•':'↔'}</span></button>`;
   }).join('');
   footer.innerHTML=`<span class="hexexp-binary-original">${base}</span><span class="hexexp-arrow">→</span><span class="hexexp-binary-live">${experiment}</span>`;
   const val=EN()?hname(experiment):('第 '+String(h.num).padStart(2,'0')+' 卦 · '+hname(experiment));
   metric.innerHTML=`<div class="hexexp-main-value"><span>${t('当前实验态','EXPLORED STATE')}</span><strong>${val}</strong></div><div class="hexexp-stats"><div><small>HAMMING</small><b>${k}<em>/ 6</em></b></div><div><small>${t('最短路径','SHORTEST PATH')}</small><b>${k}<em> ${t('步','edges')}</em></b></div><div><small>${t('可达邻居','NEIGHBORS')}</small><b>6</b></div></div>`;
   if(window.YaoOrbit?.update) window.YaoOrbit.update(experiment);
   else if(!compass.querySelector('canvas')) compass.innerHTML='<div class="orbit-loading" aria-hidden="true">64 STATES · Q₆</div>';
   controls.querySelector('#hexexp-step').textContent=t('沿一条边走一步 ↗','Walk One Edge ↗');
   controls.querySelector('#hexexp-reset').textContent=t('恢复实验态 ↺','Reset Exploration ↺');
   note.textContent=t('只改变可视化实验态，不改变掷币记录与真实之卦。线条自下而上编号；每点一次翻转一个比特。','Exploration only: your actual cast and transformed hexagram stay unchanged. Lines are numbered bottom-up; each click flips one bit.');
   
 }
 function sync(cur){
   const id=cur.primary.bits+'|'+cur.transformed.bits+'|'+cur.lines.join(',')+'|'+cur.preview;
   if(lastCastId!==id){base=cur.primary.bits;experiment=base;lastCastId=id;step=0;}
   render();
 }
 box.addEventListener('click',(event)=>{
   const btn=event.target.closest('[data-line-index]');if(!btn)return;
   const idx=Number(btn.dataset.lineIndex);
   if(!Number.isInteger(idx)||idx<0||idx>=6)return;
   experiment=bitsFlip(experiment,idx);render();
   const renewed=box.querySelector(`[data-line-index="${idx}"]`); renewed?.focus({preventScroll:true});
 });
 compass.addEventListener('click',event=>{const el=event.target.closest('[data-neighbor]');if(!el)return;experiment=bitsFlip(experiment,Number(el.dataset.neighbor));render();});
 compass.addEventListener('keydown',event=>{if(!['Enter',' '].includes(event.key))return;const el=event.target.closest('[data-neighbor]');if(!el)return;event.preventDefault();experiment=bitsFlip(experiment,Number(el.dataset.neighbor));render();});
 controls.addEventListener('click',event=>{
   if(event.target.id==='hexexp-reset'){experiment=base;step=0;render();}
   if(event.target.id==='hexexp-step'){experiment=bitsFlip(experiment,step++%6);render();}
 });
 window.YaoHexLab={sync, snapshot:()=>({base,experiment,distance:countDifferences(base,experiment)}), flip:(i)=>{if(!Number.isInteger(i)||i<0||i>5)return;experiment=bitsFlip(experiment,i);render();}};
 sync(core.getCurrent());
 window.addEventListener('yao-language-change',()=>render());
})();

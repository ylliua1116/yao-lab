/*
 * Copyright (c) 2026 Yuli Liu — YAO LAB / 爻间.
 * Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
 * Classical text content and third-party materials have separate terms.
 */
'use strict';
/* YAO LAB — cultural reading and a mathematically exact 6-bit state model.
 * Conventional (non-scientific) interpretation is kept separate from probability / graph theory.
 * Lines stored from bottom (index 0) to top (index 5).
 */
const trigramByBits = {
  '111': {name:'乾',symbol:'☰',nature:'天'}, '110':{name:'兑',symbol:'☱',nature:'泽'},
  '101': {name:'离',symbol:'☲',nature:'火'}, '100':{name:'震',symbol:'☳',nature:'雷'},
  '011': {name:'巽',symbol:'☴',nature:'风'}, '010':{name:'坎',symbol:'☵',nature:'水'},
  '001': {name:'艮',symbol:'☶',nature:'山'}, '000':{name:'坤',symbol:'☷',nature:'地'}
};
const trigrams = ['乾','兑','离','震','巽','坎','艮','坤'];
// Row is upper trigram; column is lower trigram; all bits are bottom-to-top.
const kingWenMatrix = [
 [[1,'乾'],[10,'履'],[13,'同人'],[25,'无妄'],[44,'姤'],[6,'讼'],[33,'遁'],[12,'否']],
 [[43,'夬'],[58,'兑'],[49,'革'],[17,'随'],[28,'大过'],[47,'困'],[31,'咸'],[45,'萃']],
 [[14,'大有'],[38,'睽'],[30,'离'],[21,'噬嗑'],[50,'鼎'],[64,'未济'],[56,'旅'],[35,'晋']],
 [[34,'大壮'],[54,'归妹'],[55,'丰'],[51,'震'],[32,'恒'],[40,'解'],[62,'小过'],[16,'豫']],
 [[9,'小畜'],[61,'中孚'],[37,'家人'],[42,'益'],[57,'巽'],[59,'涣'],[53,'渐'],[20,'观']],
 [[5,'需'],[60,'节'],[63,'既济'],[3,'屯'],[48,'井'],[29,'坎'],[39,'蹇'],[8,'比']],
 [[26,'大畜'],[41,'损'],[22,'贲'],[27,'颐'],[18,'蛊'],[4,'蒙'],[52,'艮'],[23,'剥']],
 [[11,'泰'],[19,'临'],[36,'明夷'],[24,'复'],[46,'升'],[7,'师'],[15,'谦'],[2,'坤']]
];
const bitByTrigram = Object.fromEntries(Object.entries(trigramByBits).map(([bits,t])=>[t.name,bits]));
const hexagrams = kingWenMatrix.flatMap((row,r)=>row.map(([num,name],c)=>({
  num,name,upper:trigrams[r],lower:trigrams[c],bits:bitByTrigram[trigrams[c]]+bitByTrigram[trigrams[r]], row:r,col:c
})));
const byNum = new Map(hexagrams.map(h=>[h.num,h]));
const byBits = new Map(hexagrams.map(h=>[h.bits,h]));
const labels=['初','二','三','四','五','上'];
const EN=()=>window.YaoI18n?.english?.()===true;
const HNAME=h=>EN()?window.YaoEnReading.hex(h.num):h.name;
const state = {lines:[],auto:false,previewNum:11,hoverNum:null,tab:'interpret',cache:new Map(), classicalPending:new Map(), notice:''};
const CAST_WINDOW_MS=5*60*1000;
const castHistory=new Map(); // In-memory in this tab, never uploaded.
const castQuestionKey=()=>($('#question')?.value||'').trim().replace(/\s+/g,' ').toLocaleLowerCase();
function castTimeNote(message){let el=$('#cast-time-note');if(!el){el=document.createElement('div');el.id='cast-time-note';el.className='cast-time-note';$('#cast-all').parentElement.insertAdjacentElement('afterend',el);}el.textContent=message|| (EN()?'Same question is stable for five minutes; a new cast is possible after expiry.':'同一问题 5 分钟内复用起卦记录；过期后再次点击会重新随机起卦。');}

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const symbolFor=n=>String.fromCharCode(0x4DC0+n-1);
const bitLine=s=>[...s].map(b=>b==='1'?7:8);
const isMoving=v=>v===6||v===9;
const currentBits=lines=>lines.map(v=>(v===7||v===9)?'1':'0').join('');
const flipBits=lines=>lines.map(v=>(v===6||v===7)?'1':'0').join('');
const dist=(a,b)=>[...a].reduce((n,x,i)=>n+(x!==b[i]),0);
const coinToss=()=>{
  const data=new Uint32Array(3);
  if(!window.crypto||!window.crypto.getRandomValues) throw new Error('当前环境不支持安全随机数，请改为手动录入实体铜钱的结果。');
  window.crypto.getRandomValues(data);
  // Use top bit: avoids modulo bias in the uniform 32-bit integer source.
  const faces=[...data].map(v=>(v>>>31)?3:2);
  return {faces,sum:faces.reduce((a,b)=>a+b,0)};
};
function getCurrent(){
 let ls,preview=false;
 if(state.lines.length===6 && state.previewNum===null) ls=[...state.lines];
 else {preview=true;ls=bitLine(byNum.get(state.previewNum??11).bits);}
 const bits=currentBits(ls),changed=flipBits(ls);
 return {lines:ls,primary:byBits.get(bits),transformed:byBits.get(changed),moving:ls.map((v,i)=>isMoving(v)?i+1:null).filter(Boolean),preview};
}
let toastTimer=0;
function notify(msg){const node=$('#toast');node.textContent=EN() ? (window.YaoDynamic?.message(msg)||msg) : msg;node.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('on'),3000)}
function drawYaoline(v,idx,mini=false){let yang=v===7||v===9;
return `<div class="yao-row ${isMoving(v)?'moving':''}">${mini?'':`<span>${EN()?(['First','Second','Third','Fourth','Fifth','Top'][idx]):labels[idx]}</span>`}<div class="yao-line">${yang?'<div class="yao-bar"></div>':'<div class="yao-break"><span></span><span></span></div>'}</div>${mini?'':`<span>${EN()?({6:'Changing yin',7:'Yang',8:'Yin',9:'Changing yang'})[v]:({6:'老阴 · 动',7:'少阳',8:'少阴',9:'老阳 · 动'})[v]}</span>`}</div>`;
}
function updateLines(){
 const target=$('#line-record');$('#cast-progress').textContent=state.lines.length+' / 6';
 target.innerHTML=state.lines.length?state.lines.map((v,i)=>drawYaoline(v,i)).reverse().join(''):(EN()?'<div class="empty-lines">— Your six lines will appear here, bottom to top —</div>':'<div class="empty-lines">— 尚未起卦，爻象将从下往上生成 —</div>');
 $('#cast-one').disabled=state.auto||state.lines.length>=6;
 $('#cast-all').disabled=state.auto;
 $('#cast-reset').disabled=state.auto;
}
function coinAnimate(faces){faces.forEach((v,i)=>{const n=$(`#coin${i}`);n.classList.remove('flip');void n.offsetWidth;n.classList.add('flip');n.innerHTML=`${v===3?(EN()?'H':'正'):(EN()?'T':'反')}<small>${v}</small>`})}
function appendOne(){if(state.lines.length>=6)return;const r=coinToss();coinAnimate(r.faces);state.lines.push(r.sum);state.previewNum=null;updateLines();if(state.lines.length===6){render()}else{drawAtlas();}}
async function autoCast(){
 if(state.auto)return;
 const key=castQuestionKey(),now=Date.now(),previous=key?castHistory.get(key):null;
 if(previous && now-previous.created<CAST_WINDOW_MS){
  state.lines=[...previous.lines];state.previewNum=null;updateLines();render();
  const mins=Math.max(1,Math.ceil((CAST_WINDOW_MS-(now-previous.created))/60000));
  castTimeNote(EN()?`Reused the same six-line result · ${mins} min remaining`:`同一问题复用原卦 · 剩余约 ${mins} 分钟`);
  notify(EN()?'Same question: original result restored, no new coins tossed.':'相同问题在 5 分钟内保留原卦，没有重新掷币。');
  document.querySelector('#reading').scrollIntoView({behavior:'smooth',block:'start'});return;
 }
 state.auto=true;state.lines=[];state.previewNum=null;updateLines();
 try{for(let i=0;i<6;i++){appendOne();await new Promise(r=>setTimeout(r,300));}
  if(key&&state.lines.length===6){castHistory.set(key,{lines:[...state.lines],created:Date.now()});
   if(castHistory.size>80){const first=castHistory.keys().next().value;castHistory.delete(first);}}
  castTimeNote(EN()?'Fresh independent cast. Same question remains stable for five minutes.':'新一轮独立起卦 · 之后同一问题 5 分钟内保持此结果。');
  document.querySelector('#reading').scrollIntoView({behavior:'smooth',block:'start'});
 }catch(e){notify(e.message)}finally{state.auto=false;updateLines();}
}
function reset(){if(state.auto)return;state.lines=[];state.previewNum=11;state.tab='interpret';document.querySelectorAll('.tab').forEach(n=>{const active=n.dataset.tab==='interpret';n.classList.toggle('active',active);n.setAttribute('aria-selected',String(active))});for(let i=0;i<3;i++)$(`#coin${i}`).innerHTML=(EN()?['H','T','Y'][i]:['乾','坤','易'][i])+'<small>3 / 2</small>';updateLines();render();}
function manual(){if(state.auto)return;const str=$('#manual-lines').value.replace(/[，,;；|/]/g,' ').trim();const values=(str.includes(' ')?str.split(/\s+/):str.split('')).map(Number);if(values.length!==6||!values.every(v=>[6,7,8,9].includes(v))){notify('请输入 6 个数，每个为 6、7、8、9，顺序为初爻到上爻');return;}state.lines=values;state.previewNum=null;updateLines();render();notify('已按实体铜钱结果排卦');}
function preview(num){state.previewNum=num;state.tab='interpret';document.querySelectorAll('.tab').forEach(n=>{const active=n.dataset.tab==='interpret';n.classList.toggle('active',active);n.setAttribute('aria-selected',String(active))});render();notify('正在预览第 '+num+' 卦 · 未改变本次投掷记录');}
function render(){const cur=getCurrent(),{primary:h,transformed:t,moving,preview:demo,lines}=cur;const q=$('#question').value.trim();const info=readings[h.num];
 $('#result-symbol').textContent=symbolFor(h.num);$('#result-number').textContent='HEXAGRAM '+String(h.num).padStart(2,'0')+(EN()?(demo?' · ATLAS PREVIEW':' · YOUR CAST'):(demo?' · 图谱探索示例':' · 本次起卦'));$('#result-name').textContent=HNAME(h);
 $('#result-pair').textContent=EN()?`${window.YaoEnReading.trigrams[h.upper]} above · ${window.YaoEnReading.trigrams[h.lower]} below · ${h.bits}`:`${trigramByBits[bitByTrigram[h.upper]].nature}${trigramByBits[bitByTrigram[h.lower]].nature}${h.name}　·　${h.bits}`;
 $('#result-summary').textContent=EN()?(demo?`Exploring ${HNAME(h)}. Select any node, or cast six lines for your own reading.`:`Primary: ${HNAME(h)}. ${moving.length?moving.length+' changing line(s) → '+HNAME(t):'No changing lines.'} A cultural reading, not a prediction.`):demo?'本页先展示第 '+h.num+' 卦。点击星图可换卦，或完成六次起卦查看真实随机结果。':`本卦 ${h.name}，${moving.length?`${moving.length} 处动爻，变化为「${t.name}」。`:'无动爻，卦象保持不变。'}以下属于传统意象的娱乐性现代反思，不是结果预测。`;
 if(!window.YaoHexLab){$('#result-line-svg').innerHTML=lines.map((v,i)=>drawYaoline(v,i,true)).reverse().join('');$('#result-binary').innerHTML=`${h.bits} <span>→</span> ${t.bits}`;}else{window.YaoHexLab.sync(cur);}
 const renderers={interpret:renderInterpret,classical:renderClassical,change:renderChange,math:renderMath};$('#result-body').innerHTML=renderers[state.tab](cur,q,info);drawAtlas();window.YaoInsight?.localInsight();
}
function renderInterpret(cur,q,r){if(EN())return window.YaoEnUI.interpret(cur,q);const {primary:h,moving,preview}=cur;const topic=$('#topic').value;return `<div class="result-grid"><div class="result-block"><span class="overline">A · THE INTERPRETATION / 非古籍原文</span><h4>${esc(r.theme)} · ${esc(r.trend)}</h4><p>${esc(r.state)}</p><div class="result-highlight"><b>这一卦给你的娱乐提示：</b><br>${esc(r.verdict)}</div><div class="trace-pills"><span>${esc(h.upper)}上 ${esc(h.lower)}下</span><span>动爻 ${moving.length} 个</span><span>${preview?'正在预览':'六掷完成'}</span></div></div><div class="result-block"><span class="overline">B · REAL-WORLD REFLECTION / 可执行而非预言</span><h4>把象意变成行动</h4><p>${esc(r.action)}</p><h4 style="font-size:20px">需要留意</h4><p>${esc(r.risk)}</p><p>${esc(topicNotes[topic]||topicNotes.general)}</p>${q?`<div class="source-note">你的提问：「${esc(q)}」<br>说明：本地规则仅根据所选分类与卦象生成提示，不会理解、验证或预测此问题本身。</div>`:''}</div></div>`;}
function renderChange(cur,q,r){if(EN())return window.YaoEnUI.change(cur);const {primary:h,transformed:t,moving,lines}=cur;let passage=moving.length?`第 ${moving.join('、')} 爻由阴变阳或由阳变阴，得到 ${t.name}。位置按初、二、三、四、五、上依次排列。`:'六爻皆静，本卦未发生位翻转，不存在不同的之卦。';const changeNotes=moving.map(i=>`<div class="result-highlight"><b>${labels[i-1]}爻 · ${lines[i-1]===6?'老阴 → 阳':'老阳 → 阴'}</b><br>${esc(yaoPositions[i-1])}</div>`).join('');return `<div class="result-grid"><div class="result-block"><span class="overline">TRANSITION / 变化轨迹</span><h4>${h.name} → ${t.name}</h4><p>${passage}</p><div class="path-row">${buildPath(cur).map((v,i)=>`<span class="path-state">${v}</span>${i<buildPath(cur).length-1?'<span class="path-arrow">→</span>':''}`).join('')}</div><p>每一个箭头代表按照初爻到上爻的可视化顺序翻转一个动爻；这个展示顺序不是传统断卦规则。</p></div><div class="result-block"><span class="overline">MOVING-LINE FOCUS / 位置提示</span><h4>${moving.length?moving.length+' 个变化焦点':'保持现状的视角'}</h4>${changeNotes||`<p>${esc(r.action)}</p>`}<p class="source-note">完整爻辞请在「卦辞 · 爻辞」标签页查看。多动爻的具体取用在不同流派中存在差异，这里不伪装为唯一正统断法。</p></div></div>`;}
function buildPath(cur){let bits=[...cur.primary.bits];const arr=[bits.join('')];cur.moving.forEach(i=>{bits[i-1]=bits[i-1]==='1'?'0':'1';arr.push(bits.join(''))});return arr;}
function renderMath(cur){if(EN())return window.YaoEnUI.math(cur);const {primary:h,transformed:t,moving}=cur;return `<div class="result-grid"><div class="result-block"><span class="overline">FORMAL REPRESENTATION / 形式表达</span><h4>状态向量：${h.bits}</h4><p>下卦 ${h.lower} = ${h.bits.slice(0,3)}，上卦 ${h.upper} = ${h.bits.slice(3)}。这一表示法采用「自下而上」的爻序，而非通常书写二进制整数的位权顺序。</p><div class="result-highlight"><b>汉明距离：H = ${dist(h.bits,t.bits)}</b><br>由两卦中不同位的个数给出，恰好等于本次动爻数：${moving.length}。</div></div><div class="result-block"><span class="overline">STATE SPACE / 六维布尔立方体</span><h4>64 个节点 · 192 条边</h4><p>当每个节点是一种六位二进制状态，任意一次单爻变化是一条边。本次 ${h.name} → ${t.name} 的最短图距离等于 ${moving.length}。</p><p>在独立公平铜钱假设下，每个本卦的出现概率为 1/64；至少出现一条动爻的理论概率为 ${(100*(1-Math.pow(.75,6))).toFixed(2)}%。</p><p class="source-note">这些是严格的组合学与概率结论；无法用来计算事件吉凶的可靠概率。</p></div></div>`;}
function renderClassical(cur){const {primary:h,moving}=cur;const entry=window.YaoClassicsData?.[h.num] || window.YaoEPUBCandidates?.[h.num] || state.cache.get(h.num);if(EN())return window.YaoEnUI.classical(cur,entry,sourceUrl(h));if(!entry){const r=readings[h.num];const linesHTML=Array.from({length:6},(_,i)=>{const p=yaoPositions[i],yang=h.bits[i]==='1'?'阳':'阴';const focus=i<3?`下卦「${h.lower}」`:`上卦「${h.upper}」`;return `<div class="line-classic ${moving.includes(i+1)?'active':''}"><b>${labels[i]}爻 · ${yang}爻${moving.includes(i+1)?' · 当前动爻':''}</b><p>${esc(r.theme)}的情境中，${focus}的第 ${i%3+1} 位可以作为观察位置。${esc(p)} ${esc(r.action)}</p></div>`;}).join('');return `<div class="result-grid"><div class="result-block"><span class="overline">OFFLINE INTERPRETIVE LAYER / 64卦 × 6爻位</span><h4>${esc(h.name)} · ${esc(r.theme)}</h4><p>${esc(r.state)}</p><div class="result-highlight"><b>本卦反思</b><br>${esc(r.verdict)}</div><p>六爻位置解读是本站原创的现代反思组合，并非《周易》原文或定论。${moving.length?`本次应重点观察第 ${moving.join('、')} 爻。`:'本次没有动爻。'}</p><h4 style="font-size:20px">在线核对真实古文（可选）</h4><p>为避免误引，未将尚未逐条核对的经文冒充为离线古籍库。需要真实的卦辞、六爻原文时，可手动请求古籍站点。</p><button class="pill border" id="reload-classical">联网核对卦辞 / 爻辞 ↗</button><p class="source-note"><a href="${sourceUrl(h)}" target="_blank" rel="noopener noreferrer">前往维基文库核对「${esc(h.name)}」↗</a> · 此操作不发送你的提问</p></div><div class="result-block"><span class="overline">SIX POSITION REFLECTIONS / 非古籍原文</span><h4>逐爻思考提示</h4><div class="classics-list">${linesHTML}</div><p class="source-note">离线完整：所有 64 种卦象均具 6 个对应位置的现代解释；尚未完成 384 条爻辞的逐字校勘，不将生成的现代解释伪称原典。</p></div></div>`;}
 if(entry.error)return `<div class="result-block"><span class="overline">SOURCE UNAVAILABLE / 不编造引文</span><h4>当前无法核对古籍原文</h4><p>${esc(entry.error)}。为了避免错误引用，这里不使用 AI 生成的文字顶替原文。</p><p class="source-note"><a class="inline-link" href="${sourceUrl(h)}" target="_blank" rel="noopener noreferrer">前往维基文库核对「${esc(h.name)}」的卦辞与六爻爻辞 ↗</a></p><button class="pill border" id="reload-classical">重新尝试</button></div>`;
 let verses=entry.yao||[];return `<div class="result-grid"><div class="result-block"><span class="overline">ORIGINAL TEXT / 《周易》· ${esc(h.name)} 卦</span><h4>卦辞原文</h4><blockquote class="verse">${esc(entry.guaci||'本条无法可靠辨认，请查阅原站。')}</blockquote><p class="source-note">来源：<a class="inline-link" href="${sourceUrl(h)}" target="_blank" rel="noopener noreferrer">维基文库《周易/${esc(h.name)}》</a> · ${entry.status==='SINGLE_SOURCE_TRANSCRIPTION'?'本站已按标注版本对照此单一来源；尚未跨底本校勘。':'从维基文库 EPUB 离线抽取的候选经文，尚未第二来源逐字校勘；异文与正文分开存放。'}不同版本用字与标点可能存在差异。</p><h4 style="font-size:21px">重点动爻</h4>${moving.length?moving.map(i=>{let line=verses[i-1];return `<blockquote class="verse"><span class="verse-label">第 ${i} 爻</span>${line?esc(line):'未能可靠提取该爻辞，请点击上方原文链接核对。'}</blockquote>`}).join(''):'<p>无动爻，可先阅读本卦卦辞；变爻爻辞不适用。</p>'}${entry.special?.length?`<h4 style="font-size:20px">特殊辞</h4>${entry.special.map(s=>`<blockquote class="verse">${esc(s)}</blockquote>`).join('')}`:''}${entry.variants?.length?`<p class="source-note">异文记载：${entry.variants.map(v=>v.position?`第${v.position}爻「${esc(v.reading)}」另作「${esc(v.alternate)}」`:`${esc(v.field.replace(/^yao/,"第")+"爻")}「${esc(v.main)}」另作「${esc(v.alternate)}」`).join('；')}（按来源页标注，未作为已统一定本）</p>`:''}</div><div class="result-block"><span class="overline">SIX LINES / 六条爻辞（初→上）</span><h4>逐爻对读</h4><div class="classics-list">${Array.from({length:6},(_,i)=>`<div class="line-classic ${moving.includes(i+1)?'active':''}"><b>${labels[i]}爻${moving.includes(i+1)?' · 动':''}</b><p>${esc(verses[i]||'未取得原文')}</p></div>`).join('')}</div><p class="source-note">${entry.status==='SINGLE_SOURCE_TRANSCRIPTION'?'本站按固定版本对照了该卦；尚未开展跨版本校勘。':'本条来自维基文库 EPUB 自动转录，结构已校验，但未经第二来源逐字复核。'}不将《彖传》《象传》或现代白话反思冒充经文。${entry.special?.length?'另附来源页的用九或用六原文。':'此处仅展示六条常规爻辞。'}</p></div></div>`;}
const sourceTitleMap={'讼':'訟','师':'師','随':'隨','蛊':'蠱','临':'臨','观':'觀','贲':'賁','剥':'剝','复':'復','离':'離','恒':'恆','遁':'遯','大壮':'大壯','晋':'晉','损':'損','颐':'頤','谦':'謙','渐':'漸','归妹':'歸妹','丰':'豐','兑':'兌','涣':'渙','节':'節','小过':'小過','既济':'既濟','未济':'未濟'};
function sourceTitle(h){return sourceTitleMap[h.name]||h.name}
function sourceUrl(h){return window.YaoClassicsData?.[h.num]?.permalink || window.YaoEPUBCandidates?.[h.num]?.sourceUrl || 'https://zh.wikisource.org/wiki/'+encodeURIComponent('周易/'+sourceTitle(h))}
const localVerified={...(window.YaoEPUBCandidates||{}),...(window.YaoClassicsData||{})}; // 4 previously inspected + 60 EPUB candidates; none cross-edition collated
// Reads the public-domain source text dynamically. If the remote request or parsing
// fails, we show an explicit error. Four pinned transcriptions and 60 one-EPUB candidates are bundled;
// these are not multi-edition collations. No invented ancient quotes are displayed.
async function loadClassical(h,force=false){if(!h)return;if(localVerified[h.num]){state.cache.set(h.num,localVerified[h.num]); if(state.tab==='classical'&&getCurrent().primary.num===h.num)render(); return;}if(!force&&state.cache.has(h.num))return;if(state.classicalPending.has(h.num))return state.classicalPending.get(h.num);
 const p=(async()=>{try{
  const url='https://zh.wikisource.org/w/api.php?action=parse&page='+encodeURIComponent('周易/'+sourceTitle(h))+'&prop=text&format=json&formatversion=2&origin=*';
  const res=await fetch(url,{mode:'cors',headers:{'Accept':'application/json'}});
  if(!res.ok)throw Error('古籍接口响应 '+res.status);
  const js=await res.json();if(js.error||!js.parse?.text)throw Error('文库没有返回可读取的原文');
  const parsed=extractClassic(js.parse.text,sourceTitle(h));
  if(!parsed.guaci||parsed.yao.filter(Boolean).length<6)throw Error('古籍页面结构不匹配，未能提取完整六爻');
  const labelsExpected=h.bits.split('').map((bit,i)=>i===0?'初'+(bit==='1'?'九':'六'):i===5?'上'+(bit==='1'?'九':'六'):(bit==='1'?'九':'六')+(i+1===2?'二':i+1===3?'三':i+1===4?'四':'五'));
  if(!parsed.yao.every((line,i)=>line.startsWith(labelsExpected[i]+'：')||line.startsWith(labelsExpected[i]+':')))throw Error('爻辞阴阳标签与卦象不匹配，已阻止不可靠引用');
  state.cache.set(h.num,{...parsed,provenance:'online-extraction-not-critical-edition'});
 }catch(e){state.cache.set(h.num,localVerified[h.num]?localVerified[h.num]:{error:e.message||'远程文本读取失败（可能是网络或跨域限制）'});}
 finally{state.classicalPending.delete(h.num);if(state.tab==='classical'&&getCurrent().primary.num===h.num)render();}})();state.classicalPending.set(h.num,p);return p;}
function extractClassic(html,name){const dom=new DOMParser().parseFromString(html,'text/html');const root=dom.querySelector('.mw-parser-output')||dom.body;
  // Wikisource layout: the first "易經" list item contains the six numbered line items.
  // Nested ULs are ignored except for their own direct text; only content before "彖曰" is used.
  const lis=[...root.querySelectorAll('li')];let first=lis.findIndex(li=>/^(易經|易经)[：:]/.test(li.textContent.trim()));
  if(first<0)first=lis.findIndex(li=>li.textContent.includes(name+'：'));
  const candidates=[];for(let i=Math.max(0,first);i<lis.length;i++){
   const el=lis[i],raw=el.textContent.replace(/\s+/g,' ').trim();
   if(i>first&&/^(彖曰|象曰|文言曰)[：:]/.test(raw))break;
   if(i>first+14)break;
   if(raw.length>450&&i===first)continue;
   candidates.push(raw);
  }
  let guaci='';const lines=[];
  for(const s of candidates){
   // A parent element can contain nested lines, so isolate its leading own text.
   let head=s.replace(/\s*(初[六九]|[六九][二三四五]|上[六九]|用[六九])[：:].*$/,'').trim();
   if(!guaci && head.startsWith(name+'：') && head.length<200)guaci=head;
   const m=s.match(/^(初[六九]|[六九][二三四五]|上[六九])[：:]/);
   if(m&&s.length<220&&!lines.some(x=>x.startsWith(m[1])))lines.push(s);
  }
  if(lines.length<6){
    // Fallback to rendered list-item chunks, cut before the first commentary heading.
    const section=html.split(/彖曰|象曰|文言曰/)[0].replace(/<\/li\s*>/gi,'\n').replace(/<\/p\s*>/gi,'\n');
    const tmp=new DOMParser().parseFromString(section,'text/html').body.textContent;
    const pat=/(初[六九]|[六九][二三四五]|上[六九])[：:]\s*([^\n]{1,180})/g;let m;
    while((m=pat.exec(tmp))&&lines.length<6){const verse=m[1]+'：'+m[2].trim();if(!lines.some(x=>x.startsWith(m[1])))lines.push(verse)}
    if(!guaci){const g=tmp.match(new RegExp(name+'[：:]\\s*([^\\n]{2,160})'));if(g)guaci=name+'：'+g[1].trim();}
  }
  const desired=['初', '二','三','四','五','上'];const sorted=desired.map((d,i)=>lines.find(x=>i===0?x.startsWith('初'):i===5?x.startsWith('上'):new RegExp('^[六九]'+d).test(x))||'');
  return {guaci,yao:sorted};
}
// --- Continuous GPU-rendered 3D atlas: drag to rotate, select 1 of 64 states ---
const atlasScene=new YaoViz.OracleViz($('#atlas-canvas'),{kind:'atlas',getState:()=>({primary:getCurrent().primary.bits,transformed:getCurrent().transformed.bits}),onSelect:bits=>{
 const h=byBits.get(bits);if(h)preview(h.num);
}});
const heroScene=new YaoViz.OracleViz($('#hero-viz'),{kind:'hero',getState:()=>({primary:getCurrent().primary.bits,transformed:getCurrent().transformed.bits})});
let mathCurrent='111000';let mathPrevious=mathCurrent;
const mathScene=new YaoViz.OracleViz($('#math-canvas'),{kind:'math',getState:()=>({primary:mathPrevious,transformed:mathCurrent})});
function resizeCanvas(){atlasScene.resize();heroScene.resize();mathScene.resize();}
function drawAtlas(){const c=getCurrent(),h=c.primary;
 $('#map-selected-title').textContent=EN()?HNAME(h):`${String(h.num).padStart(2,'0')} · ${h.name} · ${trigramByBits[bitByTrigram[h.upper]].nature}${trigramByBits[bitByTrigram[h.lower]].nature}`;
 $('#map-selected-info').textContent=EN()?`${h.bits} · ${c.moving.length} changing line(s) · click to explore · drag to rotate`:`${h.bits} · ${c.moving.length} 个动爻 · 点击节点查看相应卦象，拖拽可旋转空间`;
}
function drawHammingArt(){const out=$('#hamming-art');if(out.querySelector('canvas'))return;const points=[[25,35],[105,35],[105,115],[25,115],[70,15],[150,15],[150,95],[70,95]];let svg='<svg viewBox="0 0 180 145" aria-hidden="true">';const e=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];for(const [a,b] of e)svg+=`<line x1="${points[a][0]}" y1="${points[a][1]}" x2="${points[b][0]}" y2="${points[b][1]}" stroke="#a5c3b6" stroke-width="1.3"/>`;for(const [i,p] of points.entries())svg+=`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${i===0?'#db9b6b':'#659b91'}"/>`;out.innerHTML=svg+'</svg>'}
function renderMathBits(){const root=$('#math-bits');root.innerHTML=mathCurrent.split('').map((v,i)=>`<button type="button" data-bit="${i}" aria-label="${EN()?'Toggle bit':'切换第'} ${i+1}, ${v}" title="${EN()?'Flip bit':'点此翻转第'} ${i+1}">${v}<small>${i+1}</small></button>`).join('');const a=byBits.get(mathPrevious),b=byBits.get(mathCurrent);$('#math-readout').textContent=`${EN()?HNAME(a):a.num+'·'+a.name}  →  ${EN()?HNAME(b):b.num+'·'+b.name}    |    Hamming distance = ${dist(mathPrevious,mathCurrent)}`}
$('#math-bits').addEventListener('click',e=>{const btn=e.target.closest('button[data-bit]');if(!btn)return;let i=Number(btn.dataset.bit);mathPrevious=mathCurrent;mathCurrent=mathCurrent.slice(0,i)+(mathCurrent[i]==='0'?'1':'0')+mathCurrent.slice(i+1);renderMathBits()});
$('#math-reset').addEventListener('click',()=>{mathPrevious=mathCurrent='111000';renderMathBits()});

const fieldNames={dual:'双形态场域 · 球面与晶格',globe:'球面经纬网 · 连续转动',cube:'晶格立方体 · 空间网格',hyper:'六维超立方体 · 64节点'};
document.querySelectorAll('.mode-btn').forEach(btn=>btn.addEventListener('click',()=>{
 atlasScene.setMode(btn.dataset.mode);document.querySelectorAll('.mode-btn').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn))});
 const title=document.querySelector('.map-corner-1');if(title)title.textContent=EN()?({dual:'SPHERE & CRYSTAL',globe:'ROTATING SPHERE',cube:'CRYSTAL LATTICE',hyper:'6D STATE PROJECTION'})[btn.dataset.mode]:fieldNames[btn.dataset.mode]+' / MATHEMATICAL PROJECTION';
 notify('已切换至 '+fieldNames[btn.dataset.mode]);
}));

$('#atlas-pause').addEventListener('click',()=>{atlasScene.paused=!atlasScene.paused;$('#atlas-pause').textContent=EN()?(atlasScene.paused?'Resume Rotation ▶':'Pause Rotation Ⅱ'):(atlasScene.paused?'恢复旋转 ▶':'暂停旋转 Ⅱ')});
$('#atlas-focus').addEventListener('click',()=>{state.previewNum=state.lines.length===6?null:11;atlasScene.yaw=.2;atlasScene.pitch=.16;render();notify('已定位当前本卦')});
// --- Exports, analytics-free simulation, interactions ---
function buildReport(){const c=getCurrent(),r=readings[c.primary.num],q=$('#question').value.trim();return {project:'YAO LAB',time:new Date().toISOString(),mode:c.preview?'atlas preview':'three-coin or manual input',question:q,topic:$('#topic').value,valuesBottomToTop:c.lines,hexagram:{number:c.primary.num,name:c.primary.name,bitsBottomToTop:c.primary.bits},movingLines:c.moving,transformed:{number:c.transformed.num,name:c.transformed.name,bitsBottomToTop:c.transformed.bits},modernReading:r,source:sourceUrl(c.primary),note:'For cultural learning and entertainment; not a forecast.'};}
$('#copy-reading').addEventListener('click',async()=>{const report=buildReport(),s=`爻间 · YAO LAB\n所问：${report.question||'未填写'}\n本卦：${report.hexagram.number}·${report.hexagram.name}（${report.hexagram.bitsBottomToTop}）\n动爻：${report.movingLines.join('、')||'无'}\n之卦：${report.transformed.number}·${report.transformed.name}\n解读：${report.modernReading.verdict}\n建议：${report.modernReading.action}\n古籍：${report.source}\n— 传统文化娱乐解读，并非现实预测`;try{await navigator.clipboard.writeText(s);notify('已复制到剪贴板')}catch{const e=document.createElement('textarea');e.value=s;document.body.append(e);e.select();document.execCommand('copy');e.remove();notify('已复制')}});
$('#download-reading').addEventListener('click',()=>{const r=buildReport(),url=URL.createObjectURL(new Blob([JSON.stringify(r,null,2)],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`yao-lab-${String(r.hexagram.number).padStart(2,'0')}.json`;a.click();URL.revokeObjectURL(url);notify('已保存本次结构化结果')});
$('#run-sim').addEventListener('click',()=>{const counts=[0,0,0,0];for(let i=0;i<10000;i++){const s=coinToss().sum;counts[s-6]++;}const theoretical=[12.5,37.5,37.5,12.5];$('#sim-result').textContent=(EN()?'10,000 throws: 6=':'10000 次模拟结果：6=')+((counts[0]/100).toFixed(2))+'%、7='+((counts[1]/100).toFixed(2))+'%、8='+((counts[2]/100).toFixed(2))+'%、9='+((counts[3]/100).toFixed(2))+'%；理论分别为 '+theoretical.join(' / ')+'%。';notify('随机模拟已完成')});
$('#cast-one').addEventListener('click',()=>{try{appendOne()}catch(e){notify(e.message)}});$('#cast-all').addEventListener('click',autoCast);$('#cast-reset').addEventListener('click',reset);$('#apply-manual').addEventListener('click',manual);
$('#topic').addEventListener('change',()=>{render();window.YaoInsight?.localInsight()});$('#question').addEventListener('input',()=>{if(state.tab==='interpret')render();window.YaoInsight?.localInsight()});
document.querySelectorAll('.tab').forEach(n=>n.addEventListener('click',()=>{state.tab=n.dataset.tab;document.querySelectorAll('.tab').forEach(t=>{const on=t===n;t.classList.toggle('active',on);t.setAttribute('aria-selected',String(on))});render()}));
$('#result-body').addEventListener('click',e=>{if(e.target?.id==='reload-classical'){const h=getCurrent().primary;state.cache.delete(h.num);loadClassical(h,true);$('#result-body').innerHTML='<div class="result-block"><h4>正在从维基文库核对卦辞与爻辞…</h4><p>你的问题不会包含在此请求中。</p></div>';}});
window.addEventListener('resize',resizeCanvas);
window.YaoLabCore={hexagrams,coinToss,currentBits,flipBits,dist,extractClassic,byBits,getCurrent,sourceUrl,getClassic:(n)=>state.cache.get(n)};
updateLines();drawHammingArt();resizeCanvas();renderMathBits();render();castTimeNote();

window.addEventListener('yao-language-change',()=>{castTimeNote();updateLines();renderMathBits();render();const b=document.querySelector('#atlas-pause');if(b)b.textContent=EN()?(atlasScene.paused?'Resume Rotation ▶':'Pause Rotation Ⅱ'):(atlasScene.paused?'恢复旋转 ▶':'暂停旋转 Ⅱ');});

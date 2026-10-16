/*
 * Copyright (c) 2026 Yuli Liu — YAO LAB / 爻间.
 * Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
 * Classical text content and third-party materials have separate terms.
 */
/* YAO LAB — carefully authored UI strings; no translation API. */
(()=>{
'use strict';
const en={
'爻间首页':'YAO LAB home','主导航':'Main navigation',
'起卦实验':'Cast a Hexagram','经典解读':'Reading','六十四态':'64 States','方法透明':'About',
'文化 · 数学 · 交互':'CULTURE · MATHEMATICS · INTERACTION',
'让每一次变化，':'Every Change', '都有迹可循':'Has a Pattern',
'在这里起卦、读卦，也探索六十四态的数学之美。':'Cast a hexagram. Read its symbolism. Explore the geometry of 64 states.',
'开始一次起卦':'Cast a Hexagram','先看数学图谱':'Explore the Atlas',
'传统的语言 · 现代的结构':'ANCIENT SYMBOLS · MODERN STRUCTURES',
'种卦象状态':'possible states','单爻邻接边':'single-line edges','平均动爻数':'mean changing lines',
'六位状态，':'A map of change','一张变化地图。':'in six bits.',
'掷一卦，':'Cast the coins,','见其变。':'watch things change.',
'三枚铜钱 · 六次成卦':'Three coins · six throws',
'仪式与随机':'Ritual meets randomness',
'此刻，你想问什么？':'What is on your mind?',
'提问领域':'Question category',
'随缘一问':'General','学业 · 考试':'Study & Exams','工作 · 合作':'Work & Collaboration',
'感情 · 人际':'Relationships','财务 · 规划':'Finance & Planning','生活 · 选择':'Life & Decisions',
'六爻生成记录':'The six lines','— 尚未起卦，爻象将从下往上生成 —':'— Your six lines will appear here, bottom to top —',
'一键生成六爻':'Cast All Six','逐爻掷币':'One Throw','重置':'Reset',
'我有实体铜钱 / 直接录入爻值':'Use physical coins / enter line values',
'从初爻（最下）到上爻（最上）输入六个数字：6 老阴、7 少阳、8 少阴、9 老阳。':'Enter six values from bottom to top: 6 changing yin, 7 yang, 8 yin, 9 changing yang.',
'生成':'Apply','正面记 3，反面记 2；结果在浏览器生成。':'Heads = 3, tails = 2. Randomness is generated locally.',
'六十四态 ·':'64 States ·','形态实验场':'Living Geometry','本卦':'Primary','之卦':'Transformed',
'192 条单爻连接':'192 single-line edges','融合场域':'Combined','球面经纬':'Sphere','晶格立方':'Crystal Cube','六维投影':'6D Projection',
'暂停旋转 Ⅱ':'Pause Rotation Ⅱ','定位本卦 ↗':'Focus on Primary ↗',
'有问题，':'A question deserves','才有真正的解读。':'a closer reading.',
'象意、原典、变化，一起看':'Symbols, source texts, and changing lines',
'CURRENT READING / 本次卦象':'CURRENT READING',
'现代解读':'Interpretation','卦辞 · 爻辞':'Classical Text','动爻 · 变卦':'Changing Lines','数学视角':'Mathematics',
'文化反思与娱乐用途，不是科学预言或专业建议。':'For cultural reflection, not prediction or professional advice.',
'复制本次解读 ↗':'Copy Reading ↗','保存 JSON ↓':'Save JSON ↓',
'从卦象出发，':'Go beyond symbols.','聊聊你的问题。':'Explore your question.',
'按需解读 · 云端与本地':'On demand · cloud & on-device',
'想深入一点？让 AI 来读你的问题。':'A closer reading, shaped by your question.',
'云端优先，本机模型可选。只有点击深度解读，才会发送问题。':'Use cloud AI only when you choose. On-device AI is optional.',
'云端 AI 深度解读 ↗':'Deep Reading with AI ↗','生成离线解读 ↗':'Offline Reading ↗',
'复制到免费 AI ↗':'Copy for Free AI ↗','启动本机 AI ↗':'Use On-device AI ↗',
'AI DEEP READING / 可选背景补充':'OPTIONAL CONTEXT · DEEP READING',
'多一点背景，解读更贴近你的情况。':'Add a little context to make the reading more relevant.',
'当前情况 / 遇到的困难':'Current situation / challenges',
'希望实现的目标':'Your goal','时间节点':'Timeframe',
'验证只在点击深度解读后启动。':'Verification begins when you request an AI reading.',
'云端解读需上传本次问题及卦象；首次使用会询问你的同意。':'Cloud readings send your question and hexagram to the AI provider, with your consent.',
'浏览器本地语言模型':'On-device language model','正在检测 WebGPU 支持情况…':'Checking WebGPU support…',
'模型选择':'Choose a model','自动选择适配的轻量模型':'Auto-select a small model','下载并加载本地模型 ↗':'Download On-device Model ↗',
'本机 AI 无需 API；首次使用需下载模型。':'No API needed. First use requires a model download.',
'写下问题并完成起卦后，这里会生成一份无需联网的结构化解卦报告。':'Enter a question and cast six lines to see a cultural reading.',
'离线与隐私说明 +':'Privacy & Offline Use +',
'起卦与离线解读在浏览器进行。点击云端解读后，问题会发送给模型服务；本机 AI 则在设备端运行。请勿填写密码、证件号码等敏感信息。':'Casting and offline readings run in your browser. Cloud AI sends the question to its provider only when requested; optional on-device AI runs locally. Avoid entering sensitive information.',
'READY / 本地规则已就绪 · 语言模型尚未加载':'READY / Offline reading available · model not loaded',
'复制本次分析 ↗':'Copy Analysis ↗',
'从二进制，':'From binary','走进六维空间。':'to six dimensions.',
'数学图论 × 可交互状态转移 × 概率模型':'Graph theory · state transitions · probability',
'六位二进制':'Six Binary Bits','一爻代表一个二值变量，六爻组成一个六位向量。8 个三爻组合形成八卦；两个三爻组拼接得到 64 种卦象。':'Six yin–yang lines form a six-bit state. Two three-bit trigrams give 64 combinations.',
'六维超立方体':'The 6D Hypercube','64 个状态、192 条单爻连接，组成六维超立方体的投影。':'64 states and 192 one-bit connections form the graph of a six-dimensional hypercube.',
'三枚铜钱分布':'Three-Coin Probabilities','三枚公平铜钱的四种爻值，概率之比为 1:3:3:1。':'With three fair coins, the four line values follow a 1:3:3:1 distribution.',
'P(至少一动) = 1 − (3/4)⁶':'P(any change) = 1 − (3/4)⁶',
'亲手改变一爻，':'Flip a line.','看六维网络如何连接。':'See the network change.',
'一卦对应一个六位状态，改变一爻，就走向一个相邻节点。':'Each hexagram is a six-bit state. Flipping one line takes you to one adjacent state.',
'单击任意一位，观察状态翻转':'Select a bit to change the state',
'重置状态 ↺':'Reset State ↺','让模型接受检验':'TEST THE MODEL',
'随机性测试 · 10,000 次模拟实验':'10,000 simulated coin throws',
'点击运行，比较模拟频率与理论分布。':'Run the simulation to compare observed and theoretical frequencies.',
'运行实验':'Run Simulation',
'把边界，':'Clear sources.','写在明处。':'Clear boundaries.',
'经典文本不由 AI 编造':'Source text, not AI fiction',
'64 卦、384 条爻辞离线可读；60 卦属于 EPUB 自动转录候选，尚未经第二底本校勘。':'All 64 hexagrams and 384 classical lines are available offline as source transcriptions; 60 hexagrams remain uncollated EPUB candidates.',
'查看《周易》原文 ↗':'Read the I Ching Source ↗',
'形式科学 ≠ 预测科学':'Structure is not prediction',
'数学解释卦象结构，不证明未来可被卦象预测。':'Mathematics describes the system, not the future.',
'探索 64 态图谱 ↗':'Explore All 64 States ↗',
'本地默认 · WebGPU AI 可选':'On-device AI is optional',
'起卦与可视化在浏览器完成。本机 AI 按需下载，云端 AI 需明确同意。':'Casting and visuals run in the browser. AI modes are opt-in.',
'试用起卦台 ↗':'Try Casting ↗',
'文化 × 数学 × 交互':'Culture × Mathematics × Interaction',
'例如：这次考试，我应当重点调整什么？':'e.g. What should I focus on before my exam?',
'例如 7 8 9 8 7 6':'e.g. 7 8 9 8 7 6',
'例如：已连续复习三个月，英语分数稳定，但专业课近三次模拟下降……':'e.g. I have studied for three months, but my mock scores have dropped…',
'例如：判断下周应该先补哪门课':'e.g. Decide which subject to prioritize next week',
'例如：还有 8 周考试':'e.g. Eight weeks until my exam',
'切换第':'Toggle bit ',
};
const zhStorage=new WeakMap(), attrStorage=new WeakMap();
const escapeText=val=>String(val??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let lang='zh';try{lang=localStorage.getItem('yao-lab-lang')==='en'?'en':'zh'}catch{}
function staticText(root=document){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode())){
  if(node.parentElement?.closest('script,style,textarea,canvas,#result-body,#insight-output,#line-record,#map-selected-title,#map-selected-info,#math-bits,#math-readout,#sim-result,#model-status,#model-support,#ai-status,#result-summary,#result-name,#result-number,#result-pair,#result-binary,#result-line-svg,#cast-progress,#toast,#coin0,#coin1,#coin2'))continue;
  if(!zhStorage.has(node))zhStorage.set(node,node.textContent);
  const raw=zhStorage.get(node),lead=raw.match(/^\s*/)?.[0]||'',trail=raw.match(/\s*$/)?.[0]||'';
  const zh=raw.trim();if(!zh||!en[zh])continue;
  node.textContent=lang==='en'?lead+en[zh]+trail:raw;
 }
 for(const e of root.querySelectorAll('[placeholder],[aria-label],[title]')){
  if(e.closest('#result-body,#insight-output'))continue;
  if(!attrStorage.has(e))attrStorage.set(e,Object.fromEntries(['placeholder','aria-label','title'].map(k=>[k,e.getAttribute(k)])));
  const saved=attrStorage.get(e);
  for(const k of ['placeholder','aria-label','title']){
   const zh=saved[k];if(zh&&en[zh])e.setAttribute(k,lang==='en'?en[zh]:zh);
  }
 }
 const dot=document.querySelector('.hero .red-dot');if(dot)dot.textContent=lang==='en'?'.':'。';
 document.documentElement.lang=lang==='en'?'en':'zh-CN';
 document.title=lang==='en'?'YAO LAB · I Ching & Living Geometry':'爻间 · YAO LAB | 易象与数学的交互实验';
 document.querySelectorAll('.lang-btn').forEach(b=>{const active=b.dataset.lang===lang;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
}
function setLanguage(next){if(!['en','zh'].includes(next)||next===lang)return;lang=next;try{localStorage.setItem('yao-lab-lang',lang)}catch{}staticText();window.dispatchEvent(new CustomEvent('yao-language-change',{detail:{lang}}));}
function english(){return lang==='en'}
function label(zh,enText){return english()?enText:zh}
window.YaoI18n={english,setLanguage,label,staticText,escapeText,translations:en,get lang(){return lang}};
document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
staticText();
})();

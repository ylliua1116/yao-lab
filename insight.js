/*
 * Copyright (c) 2026 Yuli Liu — YAO LAB / 爻间.
 * Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
 * Classical text content and third-party materials have separate terms.
 */
/* YAO LAB — zero-fee hybrid cultural reflection system.
   Rules work fully offline. Optional WebLLM is downloaded and computed by user's browser.
   No API keys, analytics, third-party inference requests, or remote backend. */
(()=>{
'use strict';
const $=q=>document.querySelector(q), esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const topics={
 study:{name:'学业与考试',terms:/考试|考研|保研|升学|成绩|上岸|复习|学习|论文|答辩|录取|申请|offer|竞赛|雅思|英语|期末|高考/i,axis:'努力与反馈是否匹配',evidence:'最近三次模考成绩、薄弱知识点、剩余复习天数和目标标准',task:'把近三次练习错题归类，连续七天集中改进最弱的两类并复测',signal:'七天后复测的正确率及是否稳定提升'},
 career:{name:'科研与事业',terms:/工作|实习|招聘|求职|跳槽|科研|投稿|论文|实验|项目|导师|合作|创业|公司|职场|面试|升职/i,axis:'可交付成果与合作边界',evidence:'合同与岗位要求、对方实际反馈、已完成的里程碑、可替代方案',task:'列出一个可在两周内完成的成果，并主动向相关方取得明确反馈',signal:'里程碑是否验收，以及关键合作方是否回应'},
 relationship:{name:'情感与人际',terms:/喜欢|恋爱|感情|男友|女友|男朋友|女朋友|复合|分手|结婚|表白|他会|她会|朋友|相处|暧昧/i,axis:'沟通、双方意愿与边界',evidence:'双方实际交流记录、清楚表达的意愿、相处中持续发生的行动',task:'在尊重边界的前提下进行一次真诚沟通，关注回应而非猜测想法',signal:'对方是否明确表达意愿，双方是否能达成可持续共识'},
 money:{name:'财务与规划',terms:/投资|股票|基金|买房|理财|挣钱|盈利|发财|生意|预算|钱|收益|收入|债务|资金/i,axis:'预算、可承受损失与现金流',evidence:'本金、支出、期限、现金流与独立核对的风险材料',task:'用真实数据列出最坏情形并确定不可突破的预算界限',signal:'计划在不利情况下是否仍可以承受'},
 life:{name:'生活与抉择',terms:/选择|搬家|出国|旅游|转学|生活|家庭|应该|要不要|该不该|去不去|决定|怎么做/i,axis:'选择的可逆性与资源限制',evidence:'时间、成本、可用资源、替代方案和不可逆的后果',task:'列出两条路线的成本与可逆性，先尝试成本最低的可验证一步',signal:'试行动后是否获得新信息，而不是仅凭情绪再选一次'},
 general:{name:'一般困惑',terms:/.*/,axis:'目标、可控变量与新证据',evidence:'已经发生的事实、你真正掌握的资源和可改变的变量',task:'写下一个七天内可以检验的小行动，记录其结果',signal:'现实信息是否支持你原本的推断'}
};
const pos=[
 {name:'初爻',phase:'开端 / 基础',reading:'起始阶段宜先核实条件、先把第一步做稳',act:'先完成一个风险可控的最小动作'},
 {name:'二爻',phase:'建立 / 协作',reading:'事件开始与他人或外界资源互动，行动方式需要因地制宜',act:'确认相关人的要求与能提供的支持'},
 {name:'三爻',phase:'转折 / 摩擦',reading:'发展到关键摩擦点，轻率推进可能放大阻力',act:'设定停止条件并检查进度、分歧与资源'},
 {name:'四爻',phase:'跃迁 / 调整',reading:'临近新阶段，有机遇也有试探，应重视试错与反馈',act:'先以小范围试验验证更大范围的计划'},
 {name:'五爻',phase:'关键 / 担当',reading:'重要位置通常对应责任与判断，切勿只盯短期结果',act:'把核心决策的事实依据与备选方案写清楚'},
 {name:'上爻',phase:'极点 / 收束',reading:'来到一段过程的末端，适合审视过度、退出与下一轮循环',act:'总结得失，设定收束或者转入下一轮的标准'}
];
const intents=[['选项取舍',/要不要|该不该|是否应该|选哪|还是|两者|两个|哪个更/i],['结果焦虑',/能不能|会不会|能否|考上|录取|成功|上岸|有戏|赢|输|是否可以/i],['时间期待',/什么时候|何时|几月|多久|哪一天|几号/i],['寻求方法',/怎么|如何|怎么办|方法|怎样|应该做什么|如何改善|提高/i],['关系理解',/为什么|是否喜欢|对我|什么态度|如何看待/i]];
let latest='',engine=null,webllm=null,loading=false,generating=false,chosen='auto';
function data(){const q=$('#question').value.trim(),cur=window.YaoLabCore?.getCurrent?.();const selected=$('#topic').value;
 const domain=selected!=='general'?selected:Object.keys(topics).find(t=>t!=='general'&&topics[t].terms.test(q))||'general';
 const intent=(intents.find(([name,re])=>re.test(q))||['开放探索'])[0];return {q,cur,domain,profile:topics[domain],intent};}
function report(d){const c=d.cur,r=readings[c.primary.num],r2=readings[c.transformed.num];const movement=c.moving.map(i=>pos[i-1]);const phrase=movement.length?movement.map(p=>`${p.name}（${p.phase}）：${p.reading}；可以${p.act}。`).join('\n'):'本次六爻皆静，可把本卦当作一次较稳定的反思角度，而不是推断事情必然不变。';
 const focus=d.intent==='结果焦虑'?`你在追问结果是否会发生。${d.profile.evidence}才是评估现实可能性应当优先参考的证据；卦象不能给出成功率。`:d.intent==='选项取舍'?`你面对的是选择。建议比较各选项的机会成本、可逆性和现实证据；卦象本身不足以替你决定。`:d.intent==='时间期待'?`你关心时间节点。请根据流程、日程与外部条件估计实际时间，随机卦象不能提供可靠日期。`:`你希望找到下一步，可以把象意转化成对可控条件的检查。`;
 const paragraphs=[
  {label:'01 / 你真正关心的问题',title:`${d.profile.name} · ${d.intent}`,body:`你提到「${d.q}」。这类问题的核心往往不是一句吉凶判断，而是「${d.profile.axis}」。${focus}`},
  {label:'02 / 本卦的传统意象',title:`${c.primary.name} · ${r.theme}`,body:`${r.state} ${r.verdict} 这是从本卦主题得到的文化隐喻，不代表对你的实际处境进行过事实核实。`},
  {label:'03 / 动爻与变化',title:movement.length?`${movement.length} 条动爻 → ${c.transformed.name}`:'六爻皆静 · 保持观察',body:`${phrase} ${c.primary.num===c.transformed.num?'':`之卦「${c.transformed.name}」提供另一种反思意象：「${r2.theme}」，可以作为检验原先计划是否需要调整的角度。`}`},
  {label:'04 / 针对你的下一步',title:'做一次可以验证的小实验',body:`${d.profile.task}。结合本卦，可以进一步考虑：${r.action}；同时避免${r.risk.replace(/^不要|^避免|^谨防|^切忌/,'')}。`},
  {label:'05 / 不把卦象当证据',title:'实际需要核对什么',body:`请核对：${d.profile.evidence}。观察指标：${d.profile.signal}。只有这些真实信息，才适合支持现实判断。`}
 ];
 return {d,cur:c,primary:r,transformed:r2,paragraphs};}
function renderLocal(){if(window.YaoI18n?.english())return renderEnglishLocal();const d=data(),el=$('#insight-output');
 // Avoid claiming a focused answer when user supplied too little context for even a rule classification.
 const uncertain=d.q.length<8||(/^(会|能|行|好|可以|不可以|吉|凶)[？?！!。]*$/.test(d.q));
 if(d.q && uncertain){latest='问题信息不足，请补充具体情境、你在意的结果，以及目前掌握的事实。';el.innerHTML='<div class="insight-empty"><strong>这个问题还需要一点背景。</strong><p>请说明你想判断的具体事情、目前遇到的困难，以及你最想知道什么；规则模式不会假装读懂一句过短或含糊的提问。</p></div>';return;}
if(!d.q){el.innerHTML='<div class="insight-empty">请输入一个具体问题；本地规则会根据问题主题、卦象和动爻生成完整娱乐解读。</div>';return;}
 if(!d.cur||d.cur.preview){el.innerHTML='<div class="insight-empty">问题已记录。请先六次起卦（或手动输入 6/7/8/9），然后生成针对性解读。</div>';return;}
 const x=report(d);latest=`YAO LAB · 离线娱乐解卦\n问题：${d.q}\n本卦：${d.cur.primary.name}；动爻：${d.cur.moving.join('、')||'无'}；之卦：${d.cur.transformed.name}\n`+x.paragraphs.map(p=>`${p.title}\n${p.body}`).join('\n\n')+'\n本次仅供文化学习，不是预测。';
 el.innerHTML=`<div class="insight-results"><div class="insight-head"><span class="micro-label">OFFLINE RULE ENGINE / WITHOUT ANY API</span><span class="chip-soft">${esc(d.profile.name)} · ${esc(d.intent)}</span></div><h3>关于「${esc(d.q)}」</h3><p class="quote-question">${esc(d.cur.primary.name)} → ${esc(d.cur.transformed.name)} · ${d.cur.moving.length} 处动爻 / 主题：${esc(x.primary.theme)}</p><div class="insight-report-grid">${x.paragraphs.map((p,i)=>`<article class="insight-report-part"><span class="micro-label">${esc(p.label)}</span><h4>${esc(p.title)}</h4><p>${esc(p.body).replace(/\n/g,'<br>')}</p></article>`).join('')}</div><div class="insight-audit"><span>关于“针对性”的真实边界</span><p>此模式会识别常见主题与提问意图，组合 64 个本卦主题、6 个爻位语义和之卦信息；并非真正理解任何复杂情境。针对性建议属于现代文化类比，不能预测未来。</p></div></div>`;
 window.YaoLocalReport=x;}
function renderEnglishLocal(){
 const q=$('#question').value.trim(),cur=window.YaoLabCore?.getCurrent?.(),el=$('#insight-output'),E=window.YaoEnReading;
 const escEn=window.YaoI18n.escapeText;
 if(!q){el.innerHTML='<div class="insight-empty">Enter a question to begin your reading.</div>';return;}
 if(q.length<8){el.innerHTML='<div class="insight-empty"><strong>Could you add a little context?</strong><p>Tell us what is happening and what you would like to understand.</p></div>';return;}
 if(!cur||cur.preview){el.innerHTML='<div class="insight-empty">Your question is saved. Cast six lines (or enter line values) to begin.</div>';return;}
 const topic=$('#topic').value;
 const study=/exam|study|school|college|application|graduate|research|test/i.test(q),rel=/relationship|partner|friend|dating|love/i.test(q),job=/job|work|career|boss|company|interview/i.test(q),money=/money|investment|budget|finance|debt/i.test(q);
 const domain=topic!=='general'?topic:study?'study':rel?'relationship':job?'career':money?'money':'general';
 const r=E.r(cur.primary.num),r2=E.r(cur.transformed.num),n=E.hex(cur.primary.num),tn=E.hex(cur.transformed.num);
 const move=cur.moving.length?cur.moving.map(i=>`Line ${i}: ${E.pos[i-1][1]}`).join(' '):'No changing lines were cast.';
 const context=$('#ai-context')?.value.trim()||'',goal=$('#ai-goal')?.value.trim()||'';
 const cards=[
 ['01 / YOUR QUESTION','What you asked',`“${q}” ${context?'Context: '+context+'.':''} ${goal?'Goal: '+goal+'.':''}`],
 ['02 / THE PRIMARY HEXAGRAM',n,`${r.state} ${r.action}`],
 ['03 / THE CHANGING LINES',cur.moving.length?`${cur.moving.length} changing line(s) → ${tn}`:'No changing lines',`${move} ${cur.moving.length?'The transformed hexagram suggests another theme: '+r2.theme+'.':''}`],
 ['04 / IN PRACTICE','A grounded next step',`${E.topic[domain]} ${r.action}`]
 ];
 latest=`YAO LAB · OFFLINE CULTURAL READING\nQuestion: ${q}\n${cards.map(c=>c[1]+'\n'+c[2]).join('\n\n')}\nFor reflection, not prediction.`;
 el.innerHTML=`<div class="insight-results"><div class="insight-head"><span class="micro-label">OFFLINE · CULTURAL READING</span><span class="chip-soft">${escEn(E.r(cur.primary.num).name)}</span></div><h3>Reading your question</h3><p class="quote-question">${escEn(n)} → ${escEn(tn)} · ${cur.moving.length} changing line(s)</p><div class="insight-report-grid">${cards.map(c=>`<article class="insight-report-part"><span class="micro-label">${escEn(c[0])}</span><h4>${escEn(c[1])}</h4><p>${escEn(c[2])}</p></article>`).join('')}</div><div class="insight-audit"><span>About this reading</span><p>Offline suggestions follow symbolic rules. For a nuanced discussion of your actual situation, choose AI Deep Reading.</p></div></div>`;
}
async function ensureLib(){if(webllm)return webllm;$('#model-status').textContent='正在加载开源 WebLLM 运行时（仅首次需要联网）…';webllm=await import('https://esm.run/@mlc-ai/web-llm');return webllm;}
async function getModels(lib){const list=(lib.prebuiltAppConfig?.model_list||[]).filter(m=>/Qwen/i.test(m.model_id)&&/(0\.5B|0\.6B|1\.5B|1\.7B|0\.5b|0\.6b)/i.test(m.model_id));
 const prioritize=id=>/0\.5B|0\.6B/i.test(id)?0:/1\.5B|1\.7B/i.test(id)?1:2;
 return list.sort((a,b)=>prioritize(a.model_id)-prioritize(b.model_id));}
function status(msg){const s=window.YaoI18n?.english()?(window.YaoDynamic?.message(msg)||msg):msg;$('#model-status').textContent=s;$('#ai-status').textContent=s;}
async function loadModel(){if(loading||engine)return;loading=true;const button=$('#model-load');button.disabled=true;button.textContent=window.YaoI18n?.english()?'Preparing…':'正在准备…';try{
 if(!navigator.gpu)throw Error('当前浏览器不支持 WebGPU；仍可使用完整离线规则报告。');const adapter=await navigator.gpu.requestAdapter();if(!adapter)throw Error('没有可用的 WebGPU 设备（可能是硬件或浏览器配置限制）。');
 const lib=await ensureLib(),models=await getModels(lib);if(!models.length)throw Error('当前版本 WebLLM 没有可用的轻量 Qwen 模型。模型目录可能发生变化，请查看 README 选择兼容模型。');
 const select=$('#local-model-select');const original=select.value;select.innerHTML=models.map(m=>`<option value="${esc(m.model_id)}">${esc(m.model_id)}</option>`).join('');if(models.some(m=>m.model_id===original))select.value=original;
 chosen=select.value;const agree=window.confirm('本机模型将从第三方模型托管源下载，可能需要数百 MB 到数 GB 的网络流量和较多内存；下载后在浏览器中本地推理，不产生 API 费用。继续吗？');if(!agree){status('已取消模型下载，离线规则解读仍可使用。');return;}
 engine=await lib.CreateMLCEngine(chosen,{initProgressCallback:p=>{const n=Math.max(0,Math.min(1,Number(p.progress)||0));$('#model-progress-fill').style.width=(100*n).toFixed(0)+'%';status(p.text||`下载与初始化 ${(100*n).toFixed(0)}%`);}});$('#ask-ai').disabled=false;button.textContent=window.YaoI18n?.english()?'Model loaded ✓':'模型已加载 ✓';status('本机 WebGPU 模型已就绪 · 无需 API 密钥 · 所有推理在此设备进行。');
 }catch(e){engine=null;status('本地模型暂不可用：'+(e?.message||e));button.textContent=window.YaoI18n?.english()?'Retry model download ↗':'重试下载本地模型 ↗';}finally{loading=false;button.disabled=!!engine;}}
async function generateAI(){if(!engine||generating){return false;}const d=data();if(!d.q||!d.cur||d.cur.preview){renderLocal();return false;}
 generating=true;$('#ask-ai').disabled=true;$('#ask-ai').textContent=window.YaoI18n?.english()?'Generating on-device…':'本机生成中…';const x=report(d);const root=$('#insight-output');root.innerHTML=window.YaoI18n?.english()?'<div class="insight-results"><span class="micro-label">ON-DEVICE WEBGPU · LOCAL MODEL</span><h3>Writing your on-device reading…</h3><p>This runs locally in your browser.</p><div class="local-ai-stream" id="local-ai-stream"></div></div>':'<div class="insight-results"><span class="micro-label">ON-DEVICE WEBGPU / LOCAL SMALL MODEL</span><h3>本机 AI 正在重新组织这份解读…</h3><p>仅在设备端推理；不会向本项目服务器发送你的问题。</p><div class="local-ai-stream" id="local-ai-stream"></div></div>';
 const target=$('#local-ai-stream');const lines=x.paragraphs.map(z=>z.title+'：'+z.body).join('\n');
 try{const response=await engine.chat.completions.create({messages:[
 {role:'system',content:window.YaoI18n?.english()?'You are an English-language I Ching cultural reflection editor. Answer the exact question in natural English. Use the supplied hexagram as a metaphor, not a prediction. Do not invent source quotations, event probabilities, private facts, or outcomes. Give concrete next steps and ask one clarifying question if needed.':'你是传统文化与批判性思考的中文编辑。请只根据用户提供的规则材料进行语言整理、归纳和现实行动提示。不得杜撰卦辞爻辞、史料、成功概率、对他人想法的确定判断，也不要预测吉凶或命运。用小标题写出具体、温和、不重复的五段分析。坚持娱乐和文化反思的定位。'},
 {role:'user',content:window.YaoI18n?.english()?`Question: ${d.q}\nPrimary hexagram: ${window.YaoEnReading.hex(d.cur.primary.num)}\nChanging lines: ${d.cur.moving.join(', ')||'none'}\nTransformed: ${window.YaoEnReading.hex(d.cur.transformed.num)}\nTheme: ${window.YaoEnReading.r(d.cur.primary.num).theme}\nContext: ${$('#ai-context')?.value||'not specified'}\nGoal: ${$('#ai-goal')?.value||'not specified'}\nPlease respond specifically, in English, separating cultural metaphor from real-world evidence.`:`问题：${d.q}\n主题：${d.profile.name}\n已计算本卦：${d.cur.primary.name}；动爻：${d.cur.moving.join('、')||'无'}；之卦：${d.cur.transformed.name}\n下面是本地规则产生的材料（注意：不是原典引文）：\n${lines}\n请回应具体问题并提出可以核对的现实行动，不作事实预测。`}
 ],temperature:.55,max_tokens:700});const output=response.choices?.[0]?.message?.content||'';if(!output.trim())throw Error('本地模型未返回有效文本');target.textContent=output;latest=output;status('本地 AI 已生成 · 你没有发生任何 API 调用费用。');return true;}
 catch(e){target.textContent='本机 AI 未能完成推理：'+(e?.message||e)+'。仍可以点击“生成离线解读”获取完整报告。';status('本地模型推理失败，规则层仍可用。');return false;}
 finally{generating=false;$('#ask-ai').disabled=false;$('#ask-ai').textContent=window.YaoI18n?.english()?'Refine with On-device AI ↗':'用本机 AI 深度改写 ↗';}}
$('#copy-for-ai').addEventListener('click',async()=>{
 const d=data();if(!d.q||!d.cur||d.cur.preview){status('请先输入具体问题并完成六爻起卦。');return;}
 const x=report(d);
 const background=['当前情况：'+(document.querySelector('#ai-context')?.value.trim()||'未填写'),'希望实现的目标：'+(document.querySelector('#ai-goal')?.value.trim()||'未填写'),'时间节点：'+(document.querySelector('#ai-timeframe')?.value.trim()||'未填写')].join('\n');
 const prompt=window.YaoI18n?.english()?`You are an English-language cultural guide to the I Ching, not a fortune teller. Answer my question in natural, specific English.\n\nQuestion: ${d.q}\nContext: ${$('#ai-context')?.value||'not given'}\nGoal: ${$('#ai-goal')?.value||'not given'}\nTimeframe: ${$('#ai-timeframe')?.value||'not given'}\nPrimary hexagram: ${window.YaoEnReading.hex(d.cur.primary.num)} (${d.cur.primary.bits})\nChanging lines: ${d.cur.moving.join(', ')||'none'}\nTransformed hexagram: ${window.YaoEnReading.hex(d.cur.transformed.num)} (${d.cur.transformed.bits})\nModern reflection: ${window.YaoEnReading.r(d.cur.primary.num).state}\n\nFirst state what I am asking. Then discuss the symbolism in relation to the details I supplied, separate verifiable facts from analogy, give 2–3 practical next steps, and ask one question if context is missing. Never fabricate classical quotations, predict actual outcomes, or claim to know others' private feelings.`:`你是一位熟悉《周易》传统文化、同时注重事实判断的中文解读助手。请用日常中文直接回应我的具体问题，不要只复述卦象套话。

我的问题：${d.q}
${background}
本卦：第 ${d.cur.primary.num} 卦「${d.cur.primary.name}」
之卦：第 ${d.cur.transformed.num} 卦「${d.cur.transformed.name}」
动爻（初爻至上爻）：${d.cur.moving.join('、')||'无'}
背景分类：${d.profile.name}；问题意图：${d.intent}

下面是网站给出的现代文化解释，并非逐字校勘古籍：
${x.paragraphs.map(v=>v.title+'：'+v.body).join('\n')}

请先用一两句话确认我在问什么；如果信息明显不足，只问我一个最重要的补充问题。结合上述本卦、动爻和变卦做文化类比；若不能确认《周易》卦辞爻辞原文，请明确说无法核实，切勿编造引用。务必将卦象象意与现实证据分开，针对我的具体情境分析可控条件，给出2-3条可执行建议。不要声称能预测结果、概率或他人的内心。`;
 try{await navigator.clipboard.writeText(prompt);status('已复制解读提示词。请在你自己使用的免费 AI 聊天服务中粘贴；这会由你主动向外部服务分享问题。');}
 catch(e){status('浏览器没有授予复制权限，请先通过 HTTPS 或 localhost 打开网页，或使用“复制本次解读”。');}
});
$('#run-local').addEventListener('click',renderLocal);$('#model-load').addEventListener('click',loadModel);$('#ask-ai').addEventListener('click',generateAI);
$('#insight-copy').addEventListener('click',async()=>{if(!latest)renderLocal();try{await navigator.clipboard.writeText(latest);status('分析已复制到剪贴板。');}catch{status('无法访问剪贴板，请手动复制页面内容。')}});
const sup=document.getElementById('model-support');sup.textContent=window.YaoI18n?.english()?(window.isSecureContext&&navigator.gpu?'WebGPU detected · compatibility checked during load':!window.isSecureContext?'On-device AI needs HTTPS or localhost':'WebGPU not available · offline reading still works'):window.isSecureContext&&navigator.gpu?'检测到 WebGPU，实际内存和模型兼容性仍需加载验证':!window.isSecureContext?'当前不是安全上下文：本地 AI 需要 HTTPS 或 localhost':'未检测到 WebGPU：无需 AI 也能完整离线解卦';
if(!window.isSecureContext||!navigator.gpu){$('#model-load').disabled=true;$('#model-load').textContent='设备不支持本机 AI';}
window.YaoInsight={localInsight:renderLocal,generateAI,isOnDeviceReady:()=>!!engine,topics,report};
})();

window.addEventListener('yao-language-change',()=>{window.YaoInsight?.localInsight?.();});

window.addEventListener('yao-language-change',()=>{const sup=document.getElementById('model-support');if(sup)sup.textContent=window.YaoI18n.english()?(window.isSecureContext&&navigator.gpu?'WebGPU detected · compatibility checked during load':!window.isSecureContext?'On-device AI needs HTTPS or localhost':'WebGPU not available · offline reading still works'):window.isSecureContext&&navigator.gpu?'检测到 WebGPU，实际内存和模型兼容性仍需加载验证':!window.isSecureContext?'当前不是安全上下文：本地 AI 需要 HTTPS 或 localhost':'未检测到 WebGPU：无需 AI 也能完整离线解卦';});

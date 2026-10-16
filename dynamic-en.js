/*
 * Copyright (c) 2026 Yuli Liu — YAO LAB / 爻间.
 * Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
 * Classical text content and third-party materials have separate terms.
 */
/* Small runtime notices that cannot be translated as static HTML. */
window.YaoDynamic={message(s){
 if(!window.YaoI18n?.english())return s;
 const pairs={
 '已按实体铜钱结果排卦':'The six lines have been applied.',
 '已定位当前本卦':'Focused on the primary hexagram.',
 '随机模拟已完成':'Simulation complete.',
 '已复制到剪贴板':'Copied to clipboard.',
 '已复制':'Copied.',
 '已保存本次结构化结果':'JSON saved.',
 '请先输入具体问题并完成六爻起卦。':'Please enter a question and cast six lines first.',
 '分析已复制到剪贴板。':'Analysis copied.',
 '本地模型推理失败，规则层仍可用。':'On-device AI failed; offline reading remains available.',
 '本地 AI 已生成 · 你没有发生任何 API 调用费用。':'On-device reading complete · no API fees.',
 '已取消模型下载，离线规则解读仍可使用。':'Download cancelled. Offline reading remains available.',
 '本机 WebGPU 模型已就绪 · 无需 API 密钥 · 所有推理在此设备进行。':'On-device model ready · no API key required.',
 '已复制解读提示词。请在你自己使用的免费 AI 聊天服务中粘贴；这会由你主动向外部服务分享问题。':'Prompt copied. Paste it into the AI chat service of your choice.',
 '浏览器没有授予复制权限，请先通过 HTTPS 或 localhost 打开网页，或使用“复制本次解读”。':'Clipboard access unavailable. Try HTTPS or use Copy Reading.'
 };
 if(pairs[s])return pairs[s];
 if(s.startsWith('正在预览第 '))return 'Atlas preview · your cast is unchanged.';
 if(s.startsWith('已切换至 '))return 'Visualization changed.';
 if(s.startsWith('本地模型暂不可用：'))return 'On-device model unavailable: '+s.split('：').slice(1).join('：');
 if(s.startsWith('正在加载开源 WebLLM'))return 'Loading the WebLLM runtime…';
 if(s.startsWith('下载与初始化 '))return 'Downloading and initializing '+s.slice(7);
 if(s.startsWith('请输入 6 个数'))return 'Enter six values (6, 7, 8 or 9), bottom to top.';
 return s;
}};

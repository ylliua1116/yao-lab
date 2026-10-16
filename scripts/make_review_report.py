#!/usr/bin/env python3
# Copyright (c) 2026 Yuli Liu — YAO LAB. Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
"""Offline candidate text and apparatus browser. HTML uses only local strings.
Never changes source transcription status; never asserts manual review.
"""
import html,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
S=ROOT/'source-audit/classics-extracted-UNREVIEWED.json'
D=json.loads(S.read_text(encoding='utf8'))
E=lambda s:html.escape(str(s),quote=True)
blocks=[]
for r in D['records']:
    vlist=r.get('variants',[])
    notes=''.join(f'<li><code>{E(v["field"])}</code> · 主文 <strong>{E(v.get("main"))}</strong> / 一作 {E(v.get("alternate"))} · {E(v.get("note"))}</li>' for v in vlist) or '<li>这份 EPUB 未标注此卦异文；不代表其他底本不存在异文</li>'
    lines=''.join(f'<tr><td>{i}</td><td>{E(t)}</td><td>□ 待第二来源核对</td></tr>' for i,t in enumerate(r['yao'],1))
    parts=''.join(f'<li>{E(part)}</li>' for part in r.get('guaciParagraphs',[]))
    blocks.append(f'''<details id="h{r['number']}"><summary>{r['number']:02} · {E(r['name'])} <small>完整采集 | 跨底本未核</small></summary>
    <p><a href="{E(r['sourceUrl'])}" target="_blank" rel="noopener noreferrer">打开维基文库对应章节 ↗</a> · EPUB 章节 <code>{E(r['epubChapter'])}</code></p>
    <h3>卦辞</h3><blockquote>{E(r['guaci'])}</blockquote><p class="muted">EPUB 原有卦辞段落：</p><ol>{parts}</ol>
    <h3>六爻</h3><table><thead><tr><th>爻</th><th>原文候选</th><th>独立对校</th></tr></thead><tbody>{lines}</tbody></table>
    <h3>特殊辞</h3><p>{E('；'.join(r['special']) or '无（仅乾、坤有）')}</p>
    <h3>异文注记（与主文分离）</h3><ul>{notes}</ul>
    <p class="muted">章节 SHA-256 <code>{E(r['epubChapterSha256'])}</code></p>
    </details>''')
page=f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>YAO LAB · 64 卦 384 爻 EPUB 转录审计</title>
<style>body{{font:15px/1.8 system-ui,-apple-system,"PingFang SC",sans-serif;max-width:1080px;margin:0 auto;padding:30px;background:#f8f7f3;color:#233631}}h1{{font-size:30px}}.lead{{padding:18px 22px;background:#e9f0ed;border-left:5px solid #2c7060}}.muted,small{{color:#667c75}}details{{padding:18px 24px;background:#fff;border:1px solid #cad5d0;border-radius:12px;margin:14px 0}}summary{{cursor:pointer;font-size:19px;font-weight:700}}blockquote{{margin:12px 0;background:#f2f6f3;padding:12px 18px;border-left:3px solid #7baa9d}}table{{border-collapse:collapse;width:100%}}td,th{{text-align:left;border-bottom:1px solid #dce5df;padding:8px;vertical-align:top}}td:nth-child(2){{width:65%}}code{{word-break:break-all}}a{{color:#1c7161}}@media(max-width:600px){{body{{padding:14px}}details{{padding:12px}}td{{font-size:13px}}}}</style></head><body>
<h1>爻间 · YAO LAB / EPUB 经文核查台</h1>
<p class="lead"><strong>本次直接解析真实 EPUB：64/64 卦辞、384/384 条常规爻辞、2 条特殊辞、{D['totalVariantNotes']} 处异文注记。</strong><br>这只是单一 EPUB 来源的结构化转录；未拿第二底本逐条复核，非学术校勘定本。<br>原文来源：<a href="https://zh.wikisource.org/wiki/周易" target="_blank">维基文库《周易》</a>，详细授权见项目 LICENSE_CLASSICS.md（CC BY-SA 3.0）。<br>EPUB SHA-256：<code>{E(D['epubSha256'])}</code></p>
{''.join(blocks)}</body></html>'''
o=ROOT/'source-audit/review-report-UNVERIFIED.html';o.write_text(page,encoding='utf-8');print('Report:',o)

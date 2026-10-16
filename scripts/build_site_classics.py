#!/usr/bin/env python3
# Copyright (c) 2026 Yuli Liu — YAO LAB. Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
"""Convert audited-but-unreviewed candidate JSON to user-facing offline bundle.
Does not grant or change scholarly verification status.
"""
import json
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
D=json.loads((BASE/'source-audit/classics-extracted-UNREVIEWED.json').read_text(encoding='utf8'))
assert len(D['records'])==64
assert sum(len(x['yao']) for x in D['records'])==384
assert D['reviewStatus']=='EPUB_SOURCE_ONLY_UNREVIEWED'
d={}
for r in D['records']:
 d[str(r['number'])]={k:r[k] for k in ('number','name','bits','guaci','yao','special','variants','sourceTitle','sourceUrl','epubChapter','epubChapterSha256','status')}
 d[str(r['number'])]['sourceEpubSha256']=D['epubSha256']
s='''/* YAO LAB / wiksource EPUB candidates / not a critical edition.
 * 64 hexagram statements, 384 regular lines, 2 special lines; separate variants.
 * These are source transcriptions, NOT human-verified multi-edition texts.
 * Wikisource CC BY-SA 3.0 (see LICENSE_CLASSICS.md); original software PolyForm Shield 1.0.0 separately.
 */
window.YaoEPUBCandidates = Object.freeze('''+json.dumps(d,ensure_ascii=False,separators=(',',':'))+''');\n'''
f=BASE/'classics-epub-candidates.js';f.write_text(s,encoding='utf8')
print('Updated',f,'entries',len(d))

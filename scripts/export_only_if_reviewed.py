#!/usr/bin/env python3
# Copyright (c) 2026 Yuli Liu — YAO LAB. Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
"""Human-attested cross-source export; no automatic certification.

Requires 64 record-by-record declarations and concrete secondary bibliographic
references. This checks completeness of declarations, not their truthfulness.
"""
import csv,json,re,sys,hashlib,argparse
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]; AUD=BASE/'source-audit'
args=argparse.ArgumentParser(description='Attest source review (requires EPUB checksum and manual checklist)')
args.add_argument('--epub',required=True,help='Original source EPUB path')
SOURCE_EPUB=Path(args.parse_args().epub)
S=AUD/'classics-extracted-UNREVIEWED.json';C=AUD/'review-checklist.csv'; EPUB=SOURCE_EPUB
if not all(p.exists() for p in [S,C,EPUB]):sys.exit('缺少原始 EPUB、候选 JSON 或人工复核清单')
data=json.loads(S.read_text(encoding='utf8'))
if hashlib.sha256(EPUB.read_bytes()).hexdigest()!=data.get('epubSha256'):sys.exit('EPUB SHA256 mismatch: source does not match candidates')
with C.open(encoding='utf-8-sig',newline='') as f: checks={int(r['number']):r for r in csv.DictReader(f)}
records=data.get('records',[]);errs=[];out=[]
if len(records)!=64 or len(checks)!=64:errs.append('记录与校对表均须严格包含 64 卦')
for r in records:
    n=r['number'];c=checks.get(n,{})
    if len(r.get('yao',[]))!=6 or not r.get('guaci'):errs.append(f'{n:02} 原文缺失')
    if n<=2 and len(r.get('special',[]))!=1:errs.append(f'{n:02} 乾坤特殊辞缺失')
    for field in ('guaci_manual_checked','six_lines_manual_checked','variant_notes_checked','second_source_checked'):
        if str(c.get(field,'')).strip().upper() not in ('YES','Y','已核对'):
            errs.append(f'{n:02} {field} 未核对')
    # A concrete source is compulsory; a Y/N checkbox alone is not evidence.
    url=c.get('second_source_reference','').strip()
    if not url or url in ('YES','Y','已核对') or len(url)<12:errs.append(f'{n:02} 没有填写独立第二底本的具体书目信息/网址')
    if not c.get('reviewer','').strip() or not re.fullmatch(r'\d{4}-\d{2}-\d{2}',c.get('review_date','').strip()):errs.append(f'{n:02} 未记录审核人或正确日期')
    out.append({'number':n,'name':r['name'],'bits':r['bits'],'guaci':r['guaci'],'yao':r['yao'],
                'special':r.get('special',[]),'variants':r.get('variants',[]),
                'sourceEpubSha256':data['epubSha256'],'epubChapterSha256':r['epubChapterSha256'],
                'secondSourceReference':url,'reviewer':c.get('reviewer',''),'reviewDate':c.get('review_date',''),
                'reviewStatus':'USER_ATTESTED_CROSS_SOURCE_REVIEW_NOT_EXTERNALLY_CERTIFIED'})
if errs:
    print(f'BLOCKED: {len(errs)} outstanding human cross-source attestations')
    print('\n'.join(' - '+x for x in errs[:24]))
    sys.exit(2)
O=AUD/'classics-reviewed-ATTESTED.json';O.write_text(json.dumps({'records':out,'status':'USER_ATTESTED_NOT_EXTERNALLY_CERTIFIED'},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('User-attested review exported:',O,'(does not certify scholarly accuracy)')

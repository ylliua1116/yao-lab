#!/usr/bin/env python3
# Copyright (c) 2026 Yuli Liu — YAO LAB. Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
"""Source-faithful (not independently collated) EPUB transcription of 周易 易經.

Input is the explicit Wikisource EPUB. Standard library only. Recover
mw:LanguageVariant disabled glyphs, keep line variants separate, preserve nested
guaci paragraphs, anchor chapters by hexagram Unicode symbol U+4DC0..U+4DFF.
Do not use this extractor as proof of scholarly textual verification.
"""
import argparse,csv,hashlib,json,re,sys,zipfile
from pathlib import Path
from xml.etree import ElementTree as ET
from datetime import datetime, timezone

BASE=Path(__file__).resolve().parents[1]
X='{http://www.w3.org/1999/xhtml}'
HEX_CHARS='䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿'


def clean(s):
    return re.sub(r'\s+', ' ', s).strip()


def reconstruct(node, variants, field):
    """Full text from XHTML without editorial tooltip text; restore variant attrs."""
    def walk(el):
        kind=el.tag.rsplit('}',1)[-1]
        classes=el.get('class','').split()
        if 'variant-tooltip' in classes:
            return ''
        if el.get('typeof')=='mw:LanguageVariant':
            try:
                value=json.loads(el.get('data-mw-variant','{}'))['disabled']['t']
            except (KeyError, ValueError, TypeError):
                raise ValueError(f'Unresolvable LanguageVariant in {field}')
            if not isinstance(value,str) or not value:raise ValueError('Empty LanguageVariant')
            return value
        # Some older EPUB exports use small for editorial variant notes.
        if kind=='small' and '一作' in ''.join(el.itertext()):
            note=clean(''.join(el.itertext()))
            variants.append({'field':field,'main':None,'alternate':None,'note':note,'markup':'small'})
            return ''
        if 'variant-text' in classes:
            main=clean(''.join(walk(c)+(c.tail or '') for c in list(el) if 'variant-tooltip' not in c.get('class','').split()))
            main=clean((el.text or '')+main)
            for tooltip in el.iter():
                if 'variant-tooltip' in tooltip.get('class','').split():
                    note=clean(''.join(tooltip.itertext()))
                    m=re.search(r'一作\s*[「“\"]?([^」”\"\s]+)',note)
                    variants.append({'field':field,'main':main,'alternate':m.group(1) if m else None,'note':note,'markup':'variant-tooltip'})
            return main
        out=el.text or ''
        for ch in el:
            out+=walk(ch)
            out+=ch.tail or ''
        return out
    return clean(walk(node))


def visible_text_no_list(li,variants,field):
    s=li.find(X+'span')
    if s is None:raise ValueError(f'Missing span in {field}')
    # Nested UL/OL can be beneath the span itself; skip while reconstructing
    # the main paragraph, but preserve all paragraphs separately later.
    return reconstruct(s,variants,field)


def find_section(root):
    matches=[]
    for li in root.iter(X+'li'):
        if li.find('./'+X+'ul') is None or li.find('./'+X+'ol') is None:continue
        spans=li.findall('./'+X+'span')
        if spans and any('易經' in ''.join(x.itertext()) for s in spans for x in s.iter(X+'b')):
            matches.append(li)
    if len(matches)!=1:raise ValueError(f'Expected exactly one 易經 main section; got {len(matches)}')
    return matches[0]


def heading_name(guaci_li, variants):
    s=guaci_li.find(X+'span')
    if s is None:raise ValueError('No guaci span')
    heading=s.find(X+'b')
    if heading is None:raise ValueError('No bold title in guaci')
    name=reconstruct(heading,variants,'title')
    if not name:raise ValueError('Empty hexagram title')
    return name


def from_chapter(chapter,filename):
    root=ET.fromstring(chapter)
    symbols=[m.group(0) for x in root.iter(X+'img') if (m:=re.search('[䷀-䷿]',x.get('alt') or ''))]
    symbols=list(dict.fromkeys(symbols))
    if len(symbols)!=1:raise ValueError(f'{filename} expected 1 King Wen hexagram symbol, got {symbols}')
    number=ord(symbols[0])-0x4dc0+1
    section=find_section(root)
    base=section.find('./'+X+'ul/'+X+'li')
    if base is None:raise ValueError('No guaci li')
    variants=[]
    name=heading_name(base,variants)
    page_title=(root.find('./'+X+'head/'+X+'title').text or '').strip()
    # EPUB title elements sometimes omit text wrapped in LanguageVariant (乾, 无妄).
    # 習坎 is a verse title, but the underlying Wikisource page title is 坎.
    if not page_title or (name=='无妄' and page_title=='妄'):
        page_title=name
    parts=[visible_text_no_list(base,variants,'guaci')]
    for inner in base.iter(X+'li'):
        if inner is base:continue
        parts.append(visible_text_no_list(inner,variants,'guaci'))
    guaci=''.join(parts)  # source text has paragraph separators; do not invent new characters
    if not guaci.startswith(name):raise ValueError(f'guaci does not begin with title: {name}')
    ol=section.find('./'+X+'ol')
    y=[];special=[]
    for i,li in enumerate(ol.findall('./'+X+'li'),start=1):
        text=visible_text_no_list(li,variants,f'yao{i}' if i<=6 else 'special')
        if re.match(r'^用[九六][:：，,]',text):special.append(text)
        else:y.append(text)
    if len(y)!=6:raise ValueError(f'Expected six standard lines in {filename}, got {len(y)}')
    if number in (1,2) and len(special)!=1:raise ValueError('Missing 用九 or 用六')
    if number not in (1,2) and special:raise ValueError('Unexpected special lines')
    if not all(re.match(r'^(初[九六]|[九六][二三四五]|上[九六])[：:，,]',v) for v in y):
        raise ValueError(f'Unexpected labels {name}: {[v[:4] for v in y]}')
    if any('一作' in t for t in [guaci,*y,*special]):
        raise ValueError(f'Editorial 一作 still pollutes main text in {name}')
    return {'number':number,'nameOriginal':name,'sourcePageTitle':page_title,'guaci':guaci,'guaciParagraphs':parts,
            'yao':y,'special':special,'variants':variants,'epubChapter':filename,
            'epubChapterSha256':hashlib.sha256(chapter).hexdigest(),
            'textLayer':'易經（不含彖、象、文言）',
            'status':'EXTRACTED_FROM_EPUB_NOT_SECOND_SOURCE_VERIFIED'}


def export(epub_path,outdir,chart_path=None):
    if not zipfile.is_zipfile(epub_path):raise ValueError('Not an EPUB archive')
    if chart_path is None:chart_path=BASE/'app.js'
    code=Path(chart_path).read_text(encoding='utf-8')
    seg=code.split('const kingWenMatrix = [',1)[1].split('];\nconst bitByTrigram',1)[0]
    cells=re.findall(r"\[\s*(\d+)\s*,\s*'([^']+)'\s*\]",seg)
    tri=['乾','兑','离','震','巽','坎','艮','坤']; bits={'乾':'111','兑':'110','离':'101','震':'100','巽':'011','坎':'010','艮':'001','坤':'000'}
    chart={int(n):{'number':int(n),'name':name,'bits':bits[tri[i%8]]+bits[tri[i//8]]} for i,(n,name) in enumerate(cells)}
    if len(chart)!=64:raise ValueError('Website hexagram map is not 64 states')
    recs={};errors=[]
    with zipfile.ZipFile(epub_path) as z:
        for f in z.namelist():
            if not f.startswith('OPS/') or not f.endswith(('.xhtml','.html')):continue
            try: content=z.read(f)
            except Exception as e:errors.append(f'{f}: {e}');continue
            if b'\xe6\x98\x93\xe7\xb6\x93' not in content:continue
            try:
                r=from_chapter(content,f)
            except ValueError as e:
                if 'expected 1 King Wen hexagram symbol' not in str(e) and 'expected one' not in str(e):
                    errors.append(f'{f}: {e}')
                continue
            n=r['number']
            if n in recs:raise ValueError(f'Duplicate number {n} in {f} and {recs[n]["epubChapter"]}')
            expected=chart[n]
            # Heading: page name may be traditional or historic; do not force heading normalize.
            # Symbol plus 6 line parity labels must agree with the mathematics of this site.
            actual_labels=[re.match(r'^(.+?)[：:，,]',v).group(1) for v in r['yao']]
            planned=[('初' if i==0 else '上' if i==5 else '')+('九' if b=='1' else '六') if i in (0,5) else ('九' if b=='1' else '六')+('二三四五'[i-1]) for i,b in enumerate(expected['bits'])]
            if actual_labels!=planned:raise ValueError(f'{n:02} {r["nameOriginal"]} line labels mismatch: {actual_labels} != {planned}')
            r.update({'name':expected['name'],'bits':expected['bits'],'sourceTitle':'周易/'+r['sourcePageTitle'],
                      'sourceUrl':'https://zh.wikisource.org/wiki/周易/'+r['sourcePageTitle'],
                      'revisionId':None,'captureMethod':'offline EPUB / XHTML XML',
                      'labelsOK':True,'sourceTextSha256':hashlib.sha256(json.dumps([r['guaci'],r['yao'],r['special']],ensure_ascii=False).encode()).hexdigest()})
            recs[n]=r
    missing=sorted(set(range(1,65))-set(recs))
    if errors or missing:
        print('ERRORS:',json.dumps(errors,ensure_ascii=False,indent=2));print('MISSING',missing)
        raise ValueError(f'Completeness not met: {len(recs)}/64, errors={len(errors)}')
    records=[recs[n] for n in range(1,65)]
    variants=sum(len(r['variants']) for r in records)
    assert len(records)==64 and sum(len(r['yao']) for r in records)==384
    assert len(records[0]['special'])==1 and len(records[1]['special'])==1
    data={'title':'周易 易經 / EPUB source transcription candidates',
          'source':'User-provided Wikisource EPUB',
          'sourceUrl':'https://zh.wikisource.org/wiki/周易',
          'epubFilename':Path(epub_path).name,
          'epubSha256':hashlib.sha256(Path(epub_path).read_bytes()).hexdigest(),
          'revisionId':None,
          'warning':'STRUCTURALLY COMPLETE, SOURCE-FAITHFUL XML EXTRACTION. NOT SECOND-EDITION COLLATION OR HUMAN-VERIFIED.',
          'reviewStatus':'EPUB_SOURCE_ONLY_UNREVIEWED',
          'totalHexagrams':len(records),'totalGuaci':len(records),'totalYao':384,
          'totalSpecial':2,'totalVariantNotes':variants,'records':records}
    outdir=Path(outdir);outdir.mkdir(parents=True,exist_ok=True)
    output=outdir/'classics-extracted-UNREVIEWED.json'
    output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    with (outdir/'review-checklist.csv').open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.writer(f);w.writerow(['number','name','source_chapter','source_epub_sha256','guaci_manual_checked','six_lines_manual_checked','variant_notes_checked','second_source_checked','second_source_reference','reviewer','review_date','notes'])
        for r in records:w.writerow([r['number'],r['name'],r['epubChapter'],data['epubSha256'],'','','','','','',''])
    print(f'EXTRACTED {len(records)}/64 guaci={len(records)}, yao=384/384, special=2, variant annotations={variants}')
    print('Source EPUB SHA256:',data['epubSha256'])
    print('Human cross-source verification: 0 / 64')
    print('Wrote',output)
    return data

if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--epub',required=True,help='Real Wikisource EPUB file path')
    ap.add_argument('--out',default=str(BASE/'source-audit'))
    a=ap.parse_args()
    try:export(Path(a.epub),Path(a.out))
    except (ValueError,ET.ParseError) as e:sys.exit('ERROR '+str(e))

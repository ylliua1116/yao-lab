#!/usr/bin/env python3
# Copyright (c) 2026 Yuli Liu — YAO LAB. Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
"""YAO LAB: source EPUB candidate transcription.

Usage:
    python3 scripts/audit_wikisource.py --epub source-audit/reference/周易.epub

Offline only: no Wikisource API requests, no HTTP 429. The extraction is NOT
multi-edition scholarly collation; human verification remains separate.
"""
import argparse
from pathlib import Path
from extract_epub_precise import export
BASE=Path(__file__).resolve().parents[1]
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--epub',required=True,help='Path to a locally obtained source EPUB (not included in this repository)')
    p.add_argument('--out',default=str(BASE/'source-audit'))
    a=p.parse_args()
    export(Path(a.epub),Path(a.out))

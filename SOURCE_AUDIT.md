# Classical Texts · Corpus & Provenance

[English](#english) · [简体中文](#简体中文) · [Explore YAO LAB](README.md) · [Text license](LICENSE_CLASSICS.md)

<a id="english"></a>

YAO LAB pairs interactive hexagram geometry with a **source-traceable digital transcription of the *Zhouyi* (周易)**. This document describes the corpus included with the website: what it contains, where it came from, how it is processed, and how readers can inspect or improve it.

## Corpus at a glance

| Content | Coverage |
| :--- | ---: |
| Hexagram statements (*gua ci* / 卦辞) | **64 / 64** |
| Regular line statements (*yao ci* / 爻辞) | **384 / 384** |
| Special statements (乾 *yong jiu*, 坤 *yong liu*) | **2 / 2** |
| Source-annotated textual variants, separately recorded | **48** |
| Hexagram-to-six-bit and line-position mapping | **64 / 64** |

**Edition:** a single-source **Wikisource EPUB transcription** with structural validation. A separately collated, multi-edition scholarly text is a future editorial milestone; source transcription and collation are recorded as distinct stages.

## 1 · Source and provenance

| Field | Record |
| :--- | :--- |
| Source | [Chinese Wikisource · 周易](https://zh.wikisource.org/wiki/周易) |
| Acquisition | Exported EPUB, supplied for local processing |
| Source filename | `周易.epub` |
| Scope | The `易經` layer: hexagram and line texts, plus 乾/坤 special statements |
| EPUB SHA-256 | `a00e2c01fdb61536e89a84cb2ea3bc5938671f95715b4ebc2e605b7437cb5d00` |
| Chapter identity | EPUB XHTML path and individual chapter SHA-256 in each record |
| Wikisource revision IDs | Not captured in the EPUB (`revisionId: null`) |
| Attribution & reuse | [`LICENSE_CLASSICS.md`](LICENSE_CLASSICS.md) |

The original EPUB is not bundled with the public repository. The checksum above identifies the exact **input file** used to generate this corpus; a freshly downloaded EPUB may have a different checksum if its content has changed.

## 2 · Data in the repository

| File | Role |
| :--- | :--- |
| [`classics-epub-candidates.js`](classics-epub-candidates.js) | Browser-ready offline corpus, used by the site |
| [`source-audit/classics-extracted-UNREVIEWED.json`](source-audit/classics-extracted-UNREVIEWED.json) | Source-oriented records with chapter hashes, original names, text segments and variants |
| [`source-audit/review-checklist.csv`](source-audit/review-checklist.csv) | Row-by-row editorial review register |
| [`source-audit/REVIEW_STATUS.md`](source-audit/REVIEW_STATUS.md) | Current review status |
| [`scripts/`](scripts/) | Extraction, website export, reporting and review-gated export tools |

Each numbered record maps a King Wen hexagram identifier to six **bottom-to-top** line labels and a six-bit state. `guaci`, `yao[0..5]` and optional `special` hold the reading text; `variants` keeps the EPUB's alternate-reading annotations apart from the main text. `sourceUrl`, `epubChapter`, `epubChapterSha256` and `sourceTextSha256` support inspection and comparison.

### Editorial processing

The extraction pipeline:

1. Parses the EPUB's XHTML/XML chapters and identifies the `易經` text layer.
2. Recovers characters carried in `mw:LanguageVariant` attributes, including cases such as **无咎**.
3. Rejoins source paragraphs where a single hexagram statement spans nested markup.
4. Separates `一作` annotations into structured `variants` rather than placing them inside the reading text.
5. Checks the 64 hexagram symbols, six line labels per hexagram and parity against the site's state mapping; exports the offline browser bundle.

The **48** notes describe variants visible in this source. They are not a complete catalogue of variant readings across editions. The pipeline does not silently standardize all historical glyphs or decide among alternative readings. Commentarial layers such as `彖`, `象` and `文言` are outside this corpus.

## 3 · Quality and review status

**Structural validation completed:** 64 statements, 384 regular lines, 2 special statements, 48 separately extracted variant notes and the six-bit / line-position checks.

**Editorial review stage:** independent second-edition, line-by-line collation has **not yet been recorded**. The corpus therefore carries the status `EPUB_SOURCE_ONLY_UNREVIEWED`. Four early entries (乾、坤、屯、蒙) also have older single-source comparisons; those are not independent second-edition collation.

This distinction is intentional: **coverage**, **source fidelity**, and **cross-edition editorial review** are separate properties of a digital classical text. See the per-hexagram checklist for future review records.

## 4 · Reproduce the transcription

Requirements: **Python 3**, a local copy of the source EPUB, and the scripts in this repository. No external Python packages are required for the bundled extraction pipeline.

From the repository root:

```bash
# 1. Verify the provenance of your local source file
shasum -a 256 "/path/to/周易.epub"   # macOS

# 2. Extract the 64 hexagrams from the EPUB
python3 scripts/audit_wikisource.py --epub "/path/to/周易.epub"

# 3. Refresh the browser bundle from the extracted JSON
python3 scripts/build_site_classics.py

# 4. Build the reviewable HTML report
python3 scripts/make_review_report.py
```

Open `source-audit/review-report-UNVERIFIED.html` in a browser. The extraction command requires a local EPUB path and does not need to make 64 Wikisource API requests.

**Editorial workflow:** record the independent second-source reference, reviewed passages, variants, reviewer and date in [`review-checklist.csv`](source-audit/review-checklist.csv). Once all required records have been completed, run:

```bash
python3 scripts/export_only_if_reviewed.py --epub "/path/to/周易.epub"
```

This export checks that the review declarations and source checksum are present. The scholarly responsibility for the readings and citations remains with the reviewer; the script does not certify textual correctness.

## 5 · Propose a text correction

Text contributions are welcome as [GitHub issues](https://github.com/ylliua1116/yao-lab/issues) or pull requests. Please include the **hexagram number and name**, **line position** (or hexagram statement), **current wording**, **proposed wording**, and **bibliographic source / stable link**, along with any relevant notes on alternate characters or punctuation.

For software licensing and the separate terms governing sourced texts, see [`LICENSE`](LICENSE) and [`LICENSE_CLASSICS.md`](LICENSE_CLASSICS.md).

---

<a id="简体中文"></a>

## 简体中文 · 古籍数据与来源

爻间将《周易》原典整理为可离线读取、可检索来源的结构化文本，供卦象阅读、六爻变化和数学交互使用。本文件相当于项目的 **Corpus Card（古籍数据说明书）**，记录数据内容、来源、提取方式与维护方法。

### 数据概况

| 类型 | 当前收录 |
| :--- | ---: |
| 六十四卦卦辞 | **64 / 64** |
| 常规爻辞 | **384 / 384** |
| 乾用九、坤用六 | **2 / 2** |
| 独立记录的 EPUB 异文注记 | **48 处** |
| 卦序、六位状态与爻位阴阳结构 | **64 / 64** |

### 来源与定位

文本取自[中文维基文库《周易》](https://zh.wikisource.org/wiki/周易)导出的 EPUB，源文件名 `周易.epub`，SHA-256：

```text
a00e2c01fdb61536e89a84cb2ea3bc5938671f95715b4ebc2e605b7437cb5d00
```

网站提供的是**单一 EPUB 来源的完整结构化转录**。它已经通过卦数、爻数、爻位标签及六位状态映射检查；独立第二底本的逐条人工校勘属于下一阶段编辑工作。自动抽取与人工校勘分别记录，不互相替代。

来源记录会保存各卦 XHTML 章节路径、章节哈希与正文哈希。该 EPUB 不包含可用于回溯具体网页历史版本的页面修订号，因此本项目以 EPUB 及其章节校验和识别实际使用的数字底本。

### 文本处理方法

程序仅整理 EPUB 的 `易經` 经文层，提取卦辞、六条常规爻辞与乾坤特殊辞。解析时恢复 `mw:LanguageVariant` 标签属性中的字，连接跨标签的卦辞段落，并把 `一作` 注记放入单独的 `variants` 字段。由此，网站可以独立展示正文与来源异文，而不把注记拼入古文。`彖`、`象`、`文言` 等注释层不在当前数据库范围内。

### 文件与复现

- 网页使用：[`classics-epub-candidates.js`](classics-epub-candidates.js)
- 来源及章节信息：[`source-audit/classics-extracted-UNREVIEWED.json`](source-audit/classics-extracted-UNREVIEWED.json)
- 人工审阅清单：[`source-audit/review-checklist.csv`](source-audit/review-checklist.csv)
- 审阅进度：[`source-audit/REVIEW_STATUS.md`](source-audit/REVIEW_STATUS.md)

在仓库根目录执行下列命令；先从维基文库取得 EPUB，并核对它与上方记录的哈希是否一致。

```bash
python3 scripts/audit_wikisource.py --epub "/path/to/周易.epub"
python3 scripts/build_site_classics.py
python3 scripts/make_review_report.py
```

随后可在浏览器打开 `source-audit/review-report-UNVERIFIED.html`。复核时填写 CSV 中的第二底本来源、卦辞/爻辞/异文核对情况、审阅人及日期。完成全部 64 卦的复核记录后，可按英文版 [Editorial workflow](#4--reproduce-the-transcription) 中的命令执行人工复核登记导出。

### 参与修订

欢迎通过 [Issues](https://github.com/ylliua1116/yao-lab/issues) 或 Pull Request 提交原典修订。请注明**卦序、卦名、爻位、现有文字、建议文字、文献出处与异文依据**，以便追踪并合并。数字转录的来源署名与授权见 [`LICENSE_CLASSICS.md`](LICENSE_CLASSICS.md)，原创代码许可证见 [`LICENSE`](LICENSE)。

# Release Provenance / 版本来源记录

This document records how to make an externally verifiable, citable release of **YAO LAB**. It is **not itself** a third-party timestamp, DOI, registration, or proof of priority.

## Identity

- Project: **YAO LAB · 爻间**
- Maintainer: **Yuli Liu** — <https://github.com/ylliua1116>
- Intended canonical repository: <https://github.com/ylliua1116/yao-lab>
- Source-code license: [PolyForm Shield 1.0.0](LICENSE) + [NOTICE](NOTICE)
- Classical-text provenance & licensing: [`SOURCE_AUDIT.md`](SOURCE_AUDIT.md) and [`LICENSE_CLASSICS.md`](LICENSE_CLASSICS.md)
- Machine-readable software citation: [`CITATION.cff`](CITATION.cff)

## Recommended first public release

1. Publish the repository using the maintainer's account, after a secrets/privacy check.
2. Verify the deployed site, the classical text viewer and optional cloud flows before describing them as production-ready.
3. Create the first **GitHub Release** with an explicit tag, for example `v1.0.0`, and keep the release archive and Git history.
4. Connect the GitHub repository at <https://zenodo.org> to archive a released version and receive a **Zenodo DOI**; copy the *actual* DOI into `CITATION.cff` only after it is issued.
5. Optionally archive the public release with Software Heritage for an independent content-based **SWHID**.
6. Preserve original local source files, design drafts, source EPUB, development correspondence, and release archive in a private backup.

**A DOI provides a stable scholarly citation and archive; it is not a patent or automatic legal adjudication of ownership.** Copyright notice and archive records can support attribution and provenance; they do not prevent copying or guarantee a platform will remove a rebrand.

## GitHub comparison / issues

When you find a suspected copy, save URLs, page captures, file hashes, dated releases and a concrete code comparison before sending any report. A derivative can be permitted only within the actual software license; independent brand use is governed separately. The noncompetition restriction is not a blanket prohibition against independently written implementations. Allegations of license violation, copyright infringement, or misleading brand identity should be assessed separately.

## 中文摘要

正式公开前核对原始创作权属、第三方许可并检查仓库中不含密钥；公开后通过 GitHub Release 固定源代码版本，并将 Release 归档到 Zenodo 取得正式 DOI。可再使用 Software Heritage 的 SWHID 标识具体代码内容。保留本地设计文件、开发记录和原始源码。`SHA256SUMS.txt` 记录了本次上传包的文件内容指纹，但其本身不构成第三方时间认证。

## Author/source evidence pack

Collect independently time-stamped evidence when available: release archive checksum, canonical commit URL, original vector logo, unedited design drafts, development history, source of third-party materials, and optional archival DOI. Do not place passwords or users' private data into public records. A release, SWHID, or DOI strengthens provenance documentation, but does not automatically determine ownership disputes.

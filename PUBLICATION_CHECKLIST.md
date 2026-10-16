# Before Publication / 正式公开前检查

The files in this repository are configured for a source-available release; **publication and third-party registration are actions to be completed by the maintainer**.

- [ ] Confirm original code/artwork ownership and third-party components; review any material previously distributed under MIT or another permissive license. New licensing **cannot retroactively revoke rights under an already granted license**.
- [ ] Confirm [LICENSE](LICENSE) is the official unmodified PolyForm Shield 1.0.0 text and [NOTICE](NOTICE) carries `Required Notice:` and the project `Licensor Line of Business:`; review scope with legal counsel if consequences are material.
- [ ] Confirm classical transcription licensing and EPUB source attribution under [LICENSE_CLASSICS.md](LICENSE_CLASSICS.md).
- [ ] Check every committed file and Git history for secrets, personal data, and licensing conflicts; rotate compromised keys.
- [ ] Check potential name/logo conflicts and rights in intended launch markets. This package does not create a registered trademark.
- [ ] Refresh `preview-home.png` from the finally deployed page: its previous real screenshot predates the header wording change from “OPEN SOURCE” to “SOURCE AVAILABLE”. Keep the original Logo and geometry intact.
- [ ] Publish on the maintainer's verified GitHub account; preserve the git commit hash, source archive, and screenshot of the first public release.
- [ ] After real site checks, publish a GitHub Release and preserve it in Zenodo; add **the actually issued DOI**, not a placeholder, to `CITATION.cff`.
- [ ] Test GitHub Pages, consent/Turnstile, Workers AI, and Groq backup with genuine end-to-end calls before announcing them as fully live.

Scope note: Shield limits certain uses of **licensed software**; it does not prevent someone from writing an independent implementation of public mathematical concepts or reproducing public-domain classical text.

# Security / 安全报告

For sensitive security findings, **do not post secrets, exploit payloads targeting real users, private user messages, or full API keys in a public Issue**. Use GitHub's private vulnerability reporting when enabled, or a private maintainer contact channel listed in the repository profile.

The site uses a static frontend and an optional Cloudflare Worker backend. Keep `TURNSTILE_SECRET`, `GROQ_API_KEY`, and other credentials in Worker secrets; only the public Turnstile Site Key and Worker URL belong in frontend code. Do not commit `.env`, `.dev.vars`, access tokens, private signing keys, or user data.

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment configuration. The official status of an integration should be established by end-to-end tests; a health response reporting configured bindings is not proof of successful real-model fallback.

中文：发现安全问题请优先通过私密渠道提交，不要把密钥或用户私密信息放进公开 Issue。后端 API Secret 必须放在 Cloudflare Worker 的 Secrets 中。

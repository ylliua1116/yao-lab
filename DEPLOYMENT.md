# Deploy YAO LAB

[English](#english) · [简体中文](#简体中文) · [Back to project](README.md)

<a id="english"></a>

**One static site. An optional cloud AI service.** YAO LAB's classical library, casting desk and geometric visualizations run in the browser; Cloudflare powers the optional AI reading endpoint.

| Component | Host | Required to explore the site? |
| :--- | :--- | :--- |
| Web experience | GitHub Pages (or any static host) | Yes |
| Classical corpus | Bundled JavaScript assets | Included |
| AI API | Cloudflare Worker + Workers AI | No |
| AI backup | Groq, via the same Worker | No |

**Project site:** [ylliua1116.github.io/yao-lab](https://ylliua1116.github.io/yao-lab/) (available after the repository's Pages deployment is enabled).

## 1 · Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open **http://localhost:8000/**. Python 3 is sufficient for serving the static files; there is no frontend build step. For local development, classical texts and state-space interactions do not require a Worker. The cloud AI button uses a separately configured public HTTPS site and is not expected to work from `localhost` with the production origin settings.

## 2 · Publish the frontend

1. Commit the **contents** of this repository to your own GitHub repository, with `index.html` at the root of `main`.
2. Open **Settings → Pages → Build and deployment**.
3. Choose **Deploy from a branch**, select **`main`** and **`/(root)`**, then save.
4. Open the address displayed by GitHub Pages and check the casting desk, classical reading, languages and geometric projections.

For a project repository named `yao-lab`, the standard URL is `https://<username>.github.io/yao-lab/`. GitHub Free supports Pages for public repositories. See [GitHub Pages publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) for account-plan and repository-visibility details.

A `.nojekyll` file is included to use direct static publishing. If you used GitHub's browser upload and could not include dotfiles, you can create `.nojekyll` with **Add file → Create new file**; the current site does not depend on any underscore-prefixed folders.

## 3 · Enable optional cloud AI

The frontend and API are deployed separately. You can fork and publish the frontend without operating an AI backend; to provide AI readings on your own site, configure your own Worker and Turnstile widget.

### 3.1 Deploy the Worker

Use [`cloudflare-worker/worker.js`](cloudflare-worker/worker.js) as the Worker entry point. [`wrangler.jsonc`](wrangler.jsonc) is a reference configuration; update account-specific bindings and deployment settings if you use Wrangler. Alternatively, deploy the Worker code through the Cloudflare dashboard and add bindings there.

Configure these bindings and settings in **Workers & Pages → your Worker → Settings**:

| Name | Kind | Purpose |
| :--- | :--- | :--- |
| `AI` | Workers AI binding | Primary Qwen model |
| `RATE_LIMITER` | Rate Limiting binding | Throttles requests before model invocation |
| `TURNSTILE_SECRET` | **Secret** | Server-side token verification |
| `ALLOWED_ORIGIN` | Text variable | Origin of your static site, e.g. `https://<username>.github.io` |
| `TURNSTILE_EXPECTED_HOSTNAME` | Text variable | Hostname only, e.g. `<username>.github.io` |
| `GROQ_API_KEY` | **Secret**, optional | Groq fallback when the primary model fails |
| `GROQ_MODEL` | Text variable, optional | Override the model specified in the Worker |
| `BACKUP_RATE_LIMITER` | Rate Limiting binding, optional | An additional fallback-specific limit |

The provided `wrangler.jsonc` defines `RATE_LIMITER` with a sample limit of **4 calls / 60 seconds**. Review the limit and namespace for your own deployment. Cloudflare rate-limit counters are location-based, not a global usage ledger.

### 3.2 Set up Turnstile

Create a Turnstile widget for the **actual Pages hostname**, copy its public **Site Key**, and save its **Secret Key** only in the Worker. The frontend sends a token using action `divine`; the Worker validates it with Cloudflare Siteverify before invoking either model.

Update the public settings in [`cloud-ai.js`](cloud-ai.js):

```js
const WORKER_URL = 'https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev';
const TURNSTILE_SITE_KEY = 'YOUR_PUBLIC_SITE_KEY';
```

Set `ALLOWED_ORIGIN` to the **origin**, without `/yao-lab/`. Set `TURNSTILE_EXPECTED_HOSTNAME` to the **hostname**, without `https://` or any path. When you use a custom domain, update all three sides: Pages, Turnstile, and Worker.

[Cloudflare Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/) · [Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) · [Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)

## 4 · Verify the deployment

Use this short release checklist after publishing:

- [ ] The site loads over HTTPS; browser DevTools shows no missing CSS/JS assets.
- [ ] English and Chinese interfaces, classical text, casting and six-neighbor geometry work.
- [ ] `GET https://YOUR-WORKER.workers.dev/health` reports the required bindings as configured.
- [ ] From the published site, a user-triggered AI request passes Turnstile and returns a reading.
- [ ] Repeating the same question and hexagram within five minutes uses the frontend's existing answer rather than another AI request.
- [ ] If Groq is enabled, verify fallback in a controlled **staging** test and monitor provider usage; the `/health` endpoint checks configuration, not live provider inference.

### Troubleshooting

| Symptom | Check |
| :--- | :--- |
| Pages returns 404 | `index.html` location; Pages branch and folder; publishing status |
| Static assets do not load | Repository subpath, relative URLs, browser console |
| Origin rejected (403) | `ALLOWED_ORIGIN` exactly matches `location.origin` |
| Turnstile verification fails | Widget hostname, correct Site/Secret pair, fresh single-use token, action `divine` |
| AI rate-limited (429) | Worker Rate Limiting configuration and provider quotas |
| Cloud AI unavailable (503) | Worker bindings, service logs, Workers AI capacity, Groq availability |

**Credentials:** The Site Key and Worker URL are public browser configuration. Keep `TURNSTILE_SECRET`, `GROQ_API_KEY` and all other private credentials in Worker Secrets—not in repository files, screenshots, or commits. A visitor opening the published site does **not** need their own API key.

---

<a id="简体中文"></a>

## 简体中文 · 部署指南

**网站前端与可选云端 AI 独立部署。** 普通访客只需打开网页即可体验卦象、古籍阅读与数学交互，无须安装软件或申请密钥。开发者也可以独立部署自己的版本。

**在线入口：** [YAO LAB · 爻间](https://ylliua1116.github.io/yao-lab/)（GitHub Pages 启用后生效）。

### 1 · 本地运行

在项目根目录执行：

```bash
python3 -m http.server 8000
```

浏览器访问 **http://localhost:8000/**。不需要 Node.js 或 npm 构建。古籍阅读和数学交互可以在本地使用；生产环境的云端 AI 默认限制为指定 HTTPS 域名，因此在 localhost 不应期待直接完成云端调用。

### 2 · 发布 GitHub Pages

1. 创建仓库，将解压后的**文件夹内部内容**提交至 `main`，确保 `index.html` 位于仓库根目录。
2. 进入 **Settings → Pages → Build and deployment**。
3. 选择 **Deploy from a branch → main → /(root)**，保存并等待发布。
4. 打开 Pages 提供的网址，检查语言切换、古籍、起卦与三维交互。

`yao-lab` 项目仓库的标准地址形式是 `https://用户名.github.io/yao-lab/`。GitHub Free 免费 Pages 通常需使用 Public 仓库。上传器如果拒绝 `.nojekyll` 隐藏文件，可在 GitHub 用 **Add file → Create new file** 单独创建。

### 3 · 按需接入云端 AI

后端入口是 [`cloudflare-worker/worker.js`](cloudflare-worker/worker.js)；[`wrangler.jsonc`](wrangler.jsonc) 为配置参考。通过 Cloudflare 控制台部署 Worker，并在 Settings 中配置：

| 配置 | 类型 | 作用 |
| :--- | :--- | :--- |
| `AI` | Workers AI 绑定 | Qwen 主模型 |
| `RATE_LIMITER` | Rate Limiting 绑定 | 云端调用频率控制 |
| `TURNSTILE_SECRET` | Secret | 验证码服务端密钥 |
| `ALLOWED_ORIGIN` | Text | 例如 `https://用户名.github.io` |
| `TURNSTILE_EXPECTED_HOSTNAME` | Text | 例如 `用户名.github.io` |
| `GROQ_API_KEY` | Secret，可选 | 主模型失败时使用的 Groq 备用服务 |
| `GROQ_MODEL` | Text，可选 | 自定义备用模型名称 |
| `BACKUP_RATE_LIMITER` | 绑定，可选 | 对备用调用增加单独限制 |

在 Turnstile 创建允许实际 GitHub Pages 主机名的组件。其 **Site Key** 写入网页 [`cloud-ai.js`](cloud-ai.js)，**Secret Key** 只存放在 Worker Secrets。同一文件中还需填入自己的 Worker URL。`ALLOWED_ORIGIN` **不带项目路径** `/yao-lab/`，`TURNSTILE_EXPECTED_HOSTNAME` **不带协议** `https://`。

### 4 · 上线验收

先测试网页的中文/英文、古籍、随机起卦、六邻居与五分钟复用；然后在已经发布的域名上发起真实云端 AI 请求，检查 Turnstile 和返回结果。`/health` 用于检查配置；若启用 Groq 备用，可通过独立预发布环境验证真实切换。

常见故障优先检查：Pages 404 时看仓库根目录与发布分支；403 时看来源和 Turnstile 主机名；429 时看限流和免费配额；503 时检查 Worker 绑定与服务日志。详见上方英文 [Troubleshooting](#troubleshooting)。

完整古籍复现与来源请参阅 [`SOURCE_AUDIT.md`](SOURCE_AUDIT.md)。


---

## Software licensing / 源码授权

The original software is source-available under [PolyForm Shield 1.0.0](LICENSE) with mandatory [attribution notice](NOTICE). Forking or self-hosting remains subject to the license, including the competition limitation. Classical corpus permissions are separate: see [LICENSE_CLASSICS.md](LICENSE_CLASSICS.md). Brand use: [BRAND_POLICY.md](BRAND_POLICY.md).

原始软件代码采用 PolyForm Shield 1.0.0；下载、Fork、自行部署与二次分发应遵守对应授权及 Required Notice。古籍数字转录与 Logo / 品牌分别适用独立授权或权利政策。

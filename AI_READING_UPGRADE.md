# YAO LAB · 经文驱动的 AI 深度解读补丁

本补丁基于你上传的 **yao-lab-main.zip** 制作，仅修改了 `cloudflare-worker/worker.js` 的执行逻辑，并同步重算 `SHA256SUMS.txt` 文件指纹清单。网站页面、Turnstile 公钥、秘密变量、Logo、数学动画和历史记录无需改变。

## 具体修复

- Worker 在校验六爻位串、动爻和人机验证后，从**服务器内置的 64 卦 EPUB 转录数据库**选取卦辞、实际动爻原文、变卦卦辞；不信任浏览器自行传来的“古籍原文”。
- 适配中文与英文解读，优先解释真实动爻、问题情境和下一步；背景留空仍可完成完整卦义分析，不再固定生成多个追问。
- 主模型 Cloudflare Workers AI 和失败时的 Groq 使用**同一份经文与提示词**；保留已有校验、Turnstile、限流、冷却和安全配置。
- `/health` 新增 `classicalCorpusReady: true` 和 `readingPromptVersion: 2`，用于确认新代码已经部署。

**数据学术状态：** 经文来自项目原有的维基文库 EPUB 数字转录，64 卦 / 384 常规爻辞 / 2 特殊辞有结构校验，**仍未完成跨独立底本人工逐字校勘**。网页源码的数据来源许可与软件授权应继续分开处理。

## 如何上线（Cloudflare）

1. 打开 Cloudflare → Workers & Pages → `yao-lab-ai` → Edit code。
2. 将当前已部署的旧代码**先复制备份到本机**。
3. 用本补丁 `cloudflare-worker/worker.js` 的完整内容覆盖编辑器代码并 Deploy。**不要把整份 ZIP 上传到 Worker 编辑器。**
4. 访问 `https://yao-lab-ai.ylliua1116.workers.dev/health`，预期看到 `classicalCorpusReady: true`、`readingPromptVersion: 2`，以及此前的 AI / Turnstile / 限流健康字段。健康字段不等于真实 AI 调用成功。
5. 在 GitHub `ylliua1116/yao-lab` 仓库上传/覆盖 **`cloudflare-worker/worker.js` 与根目录 `SHA256SUMS.txt`** 并提交，确保代码与仓库内容指纹同步。**不要覆盖其他网页功能文件。**
6. 在正式网页起卦测试：例如《临》110000，动爻 2、6，变卦《颐》100001。确认回答出现“九二：咸臨，吉无不利。”与“上六：敦臨，吉无咎。”的解释。

## URL / 域名迁移注意

如果你已经将前端从 GitHub Pages 迁移到 Cloudflare Pages，新域名的 Origin、Turnstile hostname 必须先在 Worker 环境变量及 Turnstile Widget 中获准。**本补丁并未更改这些既有安全设置，也不能自动让新域名获得许可。**

## 运行验证

`node --check cloudflare-worker/worker.js` 的 ESM 警告不会影响 Cloudflare；补丁包中提供 `tests/test-reading.mjs` 用于在本机验证经文注入、边界校验和 Groq 回退（模拟服务，不消耗真实 API 配额）。

*适用于已有 PolyForm Shield 受保护源码仓库；古籍第三方转录保留独立来源和版权标记。*

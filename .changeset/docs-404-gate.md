---
"@fxri/fxwl-client": patch
---

- 优化：文档站校验补 404 两条断言（`search: false`、`sitemap.transformItems`），验收补文档站构建与产物核验
- 修复：产物断言改为从 `404.md` 读取一级标题比对搜索索引，避免改标题后检查静默失效
- 优化：验收支持 `--skip-docs`；CI 矩阵跳过文档站构建，PR 与部署链路各构建并断言一次，同一推送不再重复构建

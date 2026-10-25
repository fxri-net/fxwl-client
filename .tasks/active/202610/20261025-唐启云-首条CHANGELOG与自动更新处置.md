---
owner: 唐启云
status: 待办
created: 20261025
updated: 20261025
completed: ''
depends_on: []
scope: app
---

# 首条 CHANGELOG 与自动更新处置

计划位置：阶段五 收口 第 3 项；前置：README 与安全边界文档。

## 一、背景

本次改造横跨工程基线、主进程、渲染层与内嵌页宿主，影响面大且含配置目录迁移这类使用者可感知的变化，需要一个可追溯的版本记录；同时 `electron-builder.yml` 中的 `publish` 占位仍指向示例地址，自动更新的去留没有定论。

## 二、实施方案

- 按项目发版流程生成首条 CHANGELOG，条目按改动类型分组，重点标注配置目录迁移与内嵌页白名单两条使用者可感知变更。
- 自动更新处置二选一并落配置：保留则补更新渠道与 `electron-updater` 接入说明；移除则删除 `publish` 占位配置。
- CHANGELOG 与版本号、打包元数据同批落定。

## 三、影响范围

版本记录与发布配置；不改运行时代码。

## 四、验证方式

- CHANGELOG 内容与本次实际改动逐条对应
- `publish` 配置无占位残留
- `pnpm verify` 通过

## 五、回滚方案

`git checkout -- CHANGELOG.md package.json electron-builder.yml` 并删除变更集；已提交则按提交哈希回退。

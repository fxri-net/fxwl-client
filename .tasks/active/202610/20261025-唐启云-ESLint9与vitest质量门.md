---
owner: 唐启云
status: 待办
created: 20261025
updated: 20261025
completed: ''
depends_on: []
scope: app
---

# ESLint 9 与 vitest 质量门

计划位置：阶段一 工程基线 第 3 项；前置：tsconfig 三分与类型基线。

## 一、背景

`.eslintrc.cjs` 停留在 ESLint 8 + rushstack patch 方案，`extends` 里 `plugin:vue/vue3-recommended` 重复声明两遍；项目无任何单元测试；`package.json` 只有分散的 `lint` / `typecheck` / `build`，没有本地与 CI 共用的聚合验收命令，导致「本地自检通过、CI 才报错」的漂移没有单一真源可对。

## 二、实施方案

- 迁移到 flat config `eslint.config.mjs`：`eslint-plugin-vue` ^10、`typescript-eslint` ^8、`eslint-config-prettier`。
- 用 `eslint-plugin-n` 对 `src/main`、`src/preload` 设 `engines.node: "16.17.1"`，按 Electron 22 内置运行时校验 Node API。
- `no-restricted-globals` 拦 `structuredClone`、`fetch`；`no-restricted-properties` 拦 `at`、`findLast`（仅作用于主进程与 preload）。
- 接入 vitest，测试环境默认 node，渲染层纯函数按需覆盖。
- `package.json` 增聚合命令 `verify`：`lint → typecheck → test → build`，本地与 CI 共用这一条。
- 删 `.eslintrc.cjs` 与 rushstack 相关依赖。

## 三、影响范围

构建与校验工具链；首次全量 lint 会暴露现存代码问题，按规则整改或对存量加最小豁免，不借机大改业务逻辑。

## 四、验证方式

- `pnpm verify` 全绿
- 故意写入 `structuredClone` 与内联 `at()` 各一处，主进程侧被拦、渲染层侧放行

## 五、回滚方案

删除 `eslint.config.mjs` 与 vitest 配置，还原 `.eslintrc.cjs` 与 `package.json`；已提交则按提交哈希回退。

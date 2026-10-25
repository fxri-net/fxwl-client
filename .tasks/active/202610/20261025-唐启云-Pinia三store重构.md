---
owner: 唐启云
status: 待办
created: 20261025
updated: 20261025
completed: ''
depends_on: []
scope: app
---

# Pinia 三 store 重构

计划位置：阶段三 渲染层 第 2 项；前置：去隐式注入与 jQuery。

## 一、背景

三个 store 都是 `reactive(doData.clone(data))` 的单例对象，靠模块副作用导出，无法用 devtools 观测，也无法按需初始化；状态未分类，枚举、UI 引用与响应式数据混在一处，导致「哪些是配置、哪些是临时态」只能靠读代码判断。

## 二、实施方案

- 安装并挂载 Pinia。
- `stores/app.ts`：标题、调试开关、导航项、导航胶囊配置、主题。
- `stores/client.ts`：内嵌页地址、host、导航胶囊运行时状态。
- `stores/panel.ts`：面板索引与面板级配置。
- `stores/ui.ts`：加载态、提示、当前错误。
- 每个 store 内部按 `enums` / `elems` / `datas` 三分类组织，固定注释；`enums` 与 `datas` 用 `reactive`，`elems` 为普通对象。
- 删除旧 `stores/store.ts` 封装与模块导入即初始化的写法。

## 三、影响范围

渲染层状态来源全量替换；调用点随任务逐步迁移。⚠️ 本任务只做状态归位，持久化仍走旧通道，避免与下一任务交叉。

## 四、验证方式

- devtools 可见四个 store 及其状态变更
- 三页切换状态不丢失、不重复初始化
- `pnpm verify` 通过

## 五、回滚方案

`git checkout -- src/renderer/src/stores` 并移除 Pinia 挂载；已提交则按提交哈希回退。

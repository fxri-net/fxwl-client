# 开发指南

面向要改这个仓库的人：技术栈边界、目录职责、契约分层、状态与配置流向、安全边界，以及加字段、加通道时的固定改法。

## 技术栈

| 层次 | 选型 | 说明 |
| --- | --- | --- |
| 桌面容器 | Electron `22.3.27` | 固定大版本，最后一个支持 Windows 7 的发行线，内置 Node `16.17.1` |
| 构建 | electron-vite 5 + Vite 7 | 主进程、预加载、渲染层三份构建产物 |
| 界面 | Vue 3 + Vue Router 4 + Pinia 3 | 路由为 hash 模式，打包后直接走本地文件 |
| 组件 | Element Plus 2 | 由 `unplugin-vue-components` 按需自动引入，无需手写 import |
| 样式 | Sass | 设计令牌集中在 `styles/tokens.scss`，组件只引用变量 |
| 静态服务 | http-server | 跑在主进程内，不额外拉起子进程 |
| 测试 | Vitest | 单元测试位于 `src/__tests__/` |
| 工程 | TypeScript 5 + ESLint 9 + Prettier 3 | 三份 tsconfig 分别约束主进程、构建脚本与渲染层 |

::: warning 主进程不是 Node 20
开发机跑 Node 20，但主进程与预加载脚本运行在 Electron 22 内置的 Node `16.17.1` 上。`structuredClone`、全局 `fetch`、`Array.prototype.at`、`findLast` 等新 API 在主进程不可用，ESLint 已按 `16.17.1` 拦截，不要为了让告警消失去放宽规则。
:::

## 目录结构

```text
src/
├─ main/                主进程
│  ├─ index.ts          入口：单实例锁、窗口、IPC 注册、静态服务
│  ├─ env.ts            路径解析与命令行开关
│  ├─ window.ts         主窗口创建、尺寸记忆、强制置顶
│  ├─ security.ts       导航策略、内嵌页放行、权限与下载拒绝
│  ├─ ipc/              通道注册：app / config / dialog / service
│  └─ service/          配置存储、数据迁移、端口探测、静态服务
├─ preload/index.ts     白名单桥：只暴露 NativeBridge 声明的方法
├─ renderer/            Vue 3 界面
│  ├─ index.html        内容安全策略占位，构建期注入
│  └─ src/
│     ├─ components/    页面外壳、动作栏、底栏、导航胶囊、设置控件
│     ├─ composables/   useBridge：配置水合与回写
│     ├─ libs/          基础工具（含 Element Plus 消息封装）
│     ├─ router/        路由声明与守卫
│     ├─ stores/        app / client / panel 三个 store
│     ├─ styles/        设计令牌与基础样式
│     └─ views/         首页、配置页、客户端页
├─ shared/              三端共用
│  ├─ config.ts         配置结构、默认值、迁移与归一
│  ├─ contract.ts       IPC 契约、事件契约、入参校验
│  └─ defines.ts        锚点、存储范围、服务状态、会话分区
└─ __tests__/           单元测试
```

`resources/` 放随包资源（如窗口图标），`build/` 放打包资源（安装包图标、公证脚本、授权文件）。

## 日常命令

```sh
pnpm install        # 安装依赖
pnpm dev            # 开发模式，渲染层热更新
pnpm test           # 单元测试
pnpm test:watch     # 单元测试监听
pnpm lint           # ESLint
pnpm format         # Prettier 全量格式化
pnpm verify         # 验收：lint → typecheck → test → build
```

`pnpm verify` 是本地与流水线共用的唯一验收入口，提交前跑这一条即可，不要再拆步骤单独判断。

## 契约分层

跨进程调用不做「万能通道」，所有能力按域声明在 [contract.ts](https://github.com/fxri-net/fxwl-client/blob/main/src/shared/contract.ts)：

| 域 | 通道 | 用途 |
| --- | --- | --- |
| 应用 | `app:version` / `app:restart` / `app:quit` / `app:openConfigDir` | 版本查询与进程级动作 |
| 配置 | `config:get` / `config:set` / `config:reset` / `config:dir` | 按存储范围读写与重置 |
| 服务 | `service:start` / `service:stop` / `service:status` / `service:port` | 静态服务生命周期与端口探测 |
| 对话 | `dialog:openDirectory` | 选择目录 |

约定：

- `IpcContract` 一处声明入参与出参，主进程注册与渲染层类型都由它派生，改协议只改这里。
- `IPC_VALIDATORS` 与通道一一对应，主进程在真正执行前先校验入参，校验不过直接拒绝。
- 主进程单向推送走 `EventContract`，目前只有 `client:shortcut`（内嵌页快捷键）。
- 预加载只把 `NativeBridge` 声明的方法挂到 `window.doNative`，页面拿不到 `ipcRenderer`，通道白名单之外不可达。
- 渲染层统一经 `window.doNative` 调用，纯浏览器环境（如 `docs` 里跑页面）下该对象为空，调用方需容忍。

## 状态三分与配置流向

渲染层状态按存储范围拆成三个 store，与配置文件三段一一对应：

| store | 存储范围 | 内容 |
| --- | --- | --- |
| `app` | `app` | 标题、调试开关、默认页面、页面列表、面板索引 |
| `panel` | `panel` | 窗口尺寸与展示行为、静态服务配置 |
| `client` | `client` | 内嵌页地址与导航胶囊配置 |

启动时 `useBridge()` 先按范围水合，再挂监听：

1. 主进程 `config:get` 返回归一后的配置。
2. 只取 store 里已存在的键合并，配置侧独有字段（如 `version`）不进入视图。
3. 水合完成后才对 store 挂 `deep watch`——先监听后水合会让默认值覆盖磁盘配置。
4. 变更合并 500 ms 后整体回写；重启、退出、重置等动作前调 `flushBridge()` 立即落盘，避免防抖窗口内丢配置。
5. 读写失败只弹提示，内存态保留，不静默丢数据。

主进程读取配置一律经过 `doConfig.migrate()`：先按 `version` 逐级迁移，再做归一（补默认值、收敛取值范围、剔除非法项），因此业务代码拿到的永远是当前版本的完整结构。

## 配置页 schema 驱动

配置页不手写表单，字段声明在 `views/index/schema.ts` 的 `CONFIG_PANELS`：

- `label` 行标签，`path` 为相对所属 store 的点分路径（如 `window.width`）。
- `type` 取 `text` / `switch` / `select` / `dir`，对应不同控件。
- `span` 控制栅格宽度，`gap` 给第二列留左白。
- `options` 可以是静态表，也可以是函数，运行时读取页面列表等数据。

新增字段时只需在 schema 追加一行，并同步 `shared/config.ts` 的类型、默认值与归一逻辑。

## 安全边界

主窗口与内嵌页的收紧策略集中在 `main/security.ts`：

- 主窗口 `webPreferences`：`sandbox: true`、`contextIsolation: true`、`nodeIntegration: false`，`webviewTag` 仅为承载内嵌页开启。
- 主框架只允许停留在应用自身页面，站外链接一律 `shell.openExternal`。
- 内嵌页挂载前按配置主机名白名单校验，不通过直接拒绝；同时覆写 `webPreferences`，删掉页面自带预加载脚本。
- 内嵌页使用独立会话分区 `fx-client`（不带 `persist`，仅内存），权限申请与查询全部拒绝，下载拦截，新窗口交给系统浏览器。
- 内嵌页销毁时清理会话数据，下次进入从干净状态开始。
- 快捷键：焦点在内嵌页时宿主收不到键盘事件，由主进程 `before-input-event` 转发 `Alt+←` 与 `Esc`；输入框或全屏态下 `Esc` 交还页面。

构建期还会向 `index.html` 注入内容安全策略，开发模式不注入以免影响热更新。

## 样式约定

- 颜色、圆角、间距、动效统一走 `--fx-*` 令牌，主题色同时覆盖 Element Plus 的 `--el-color-*` 衍生色。
- 业务类名统一 `fx-` 前缀，避免与内嵌站点样式互相污染。
- 组件样式使用 `scoped`，需要穿透 Element Plus 内部结构时用 `:deep()`。

## 新增配置字段

以增加「窗口最小宽度」为例：

1. 在 `src/shared/config.ts` 的类型 `WindowSection` 加字段，并在 `CONFIG_DEFAULTS` 给默认值。
2. 在 `normalizeWindow` 里补归一规则，明确缺省值与取值范围。
3. 如果旧配置需要换算或删除旧键，在同文件的 `CONFIG_MIGRATIONS` 追加一级迁移函数，并把 `CONFIG_VERSION` 加一。只做向前迁移，不写降级。
4. 在 `src/renderer/src/views/index/schema.ts` 的对应分组追加一行，配置页即可渲染。
5. 若主进程要立即使用该字段，在读取处经 `doConfig.migrate()` 取值，不要在业务处自行解析原始配置。
6. 补一条 `src/__tests__/config.test.ts` 用例覆盖默认值与越界收敛，再跑 `pnpm verify`。

## 新增 IPC 通道

1. `src/shared/contract.ts` 的 `IpcContract` 声明通道与出入参，同步补 `IPC_CHANNEL` 常量。
2. 写对应的入参校验函数，挂进 `IPC_VALIDATORS`。
3. 需要暴露给页面时，在 `NativeBridge` 里补方法签名。
4. 主进程在 `src/main/ipc/` 按域注册处理函数，注册前先过校验。
5. 预加载 `src/preload/index.ts` 补对应的白名单转发。
6. 补 `src/__tests__/contract.test.ts` 用例覆盖校验分支。

## 提交与发布

- 提交信息用中文类型头（新增 / 修改 / 修复 / 优化 / 清理 / 文档），标题写祈使句。
- 用户可感知的改动通过 `pnpm changelog:add` 建变更集，发版由 `pnpm changelog:version` 消费变更集生成 `CHANGELOG.md`，不要手改版本号。
- 文档站的更新日志页由 `pnpm sync:changelog-doc` 从根 `CHANGELOG.md` 生成，改完日志再执行一次同步。
- 三平台出包细节见[构建与打包](./build)。

## 持续集成与文档发布

两条托管链路只调用同一条聚合验收命令，不在流水线里另抄步骤清单：

| 链路 | 校验 | 文档发布 |
| --- | --- | --- |
| GitHub | 三平台矩阵跑 `pnpm verify`，Windows 追加免安装目录出包冒烟 | 主干推送后构建并发布 Pages |
| GitLab | 默认分支跑 `pnpm verify` | `pages` 阶段构建并产出 `public` |

- 文档站基址经 `VITEPRESS_BASE` 注入，规范地址与页脚编辑回链经 `SITE_URL`、`REPO_URL` 注入；仓库内只保留默认值，两平台的实际值由流水线或 CI/CD 变量提供。
- 检出需完整历史，否则「最后更新于」会全部显示为最近一次提交时间。
- ⚠️ 部署前需在平台侧开启 Pages（GitHub 选 GitHub Actions 作为来源），GitLab 需已注册 Runner 并启用 Pages。

# 构建与打包

从源码构建到三平台出包：命令分工、产物位置、打包配置与 Windows 7 约束。

## 环境准备

- Node.js `20.20.2`（仓库 `.node-version` 已锁定，CI 同源）
- pnpm `10.34.4`（`packageManager` 已锁定）
- 首次构建前执行 `pnpm install`

```sh
pnpm install
pnpm verify
```

## 命令分工

| 命令 | 作用 | 产物 |
| --- | --- | --- |
| `pnpm dev` | 开发模式，渲染层热更新 | 无 |
| `pnpm start` | 以生产产物预览应用 | 无 |
| `pnpm build` | 类型检查 + 打包源码（不生成安装包） | `out/` |
| `pnpm build:win` | 构建源码 + Windows 安装包 | `dist/` |
| `pnpm build:mac` | 构建源码 + macOS 磁盘映像 | `dist/` |
| `pnpm build:linux` | 构建源码 + Linux 多格式产物 | `dist/` |
| `pnpm build:win-shell` | 跳过源码构建，直接出 Windows 包 | `dist/` |
| `pnpm build:mac-shell` | 跳过源码构建，直接出 macOS 包 | `dist/` |
| `pnpm build:linux-shell` | 跳过源码构建，直接出 Linux 包 | `dist/` |

`*-shell` 只跑 electron-builder，用于源码未改动、只想重新出包的场景；平时用带 `build` 的完整命令。

::: tip 跨平台出包
electron-builder 只能产出当前系统可处理的格式。三平台完整产物分别在各平台构建，不要在 Windows 上强出 macOS 包。
:::

## 产物

- `out/`：electron-vite 的三份产物，`out/main`、`out/preload`、`out/renderer`，`package.json` 的 `main` 指向 `out/main/index.js`。
- `dist/`：安装包与解包目录。产物命名模板为 `${description}-${version}.${ext}`，即「方弦物联：桌面终端-版本号.扩展名」。

各平台目标格式：

| 平台 | 格式 | 说明 |
| --- | --- | --- |
| Windows | NSIS 安装包 | 非一键安装，允许改安装目录，创建桌面快捷方式 |
| macOS | DMG | 需要时在 CI 上做公证 |
| Linux | AppImage / snap / deb | 同一份源码产出三种格式 |

## 打包配置要点

配置集中在 `electron-builder.yml`：

- `appId` 固定为 `net.fxri.fxwl-client`，与公证脚本中的标识保持一致，不要单独改一处。
- `electronDist: node_modules/electron/dist` 复用已安装的 Electron 二进制，打包时不再下载约 92 MB 的发行包，弱网环境不会长时间卡住。
- `npmRebuild: false`：没有原生模块需要重编译，跳过可显著缩短出包时间。
- `asarUnpack: resources/**`：窗口图标等资源需要以真实文件存在，不能压在 asar 里。
- `afterSign: build/notarize.js`：macOS 公证钩子。

打包时排除开发文件：`src/`、`config/`、`website/`、`build/`、`docs/`、`scripts/`、各类配置文件与 `CHANGELOG.md`、`README.md` 等文档。新增顶层工具目录时记得同步 `files` 排除项，避免把无关文件塞进安装包。

## macOS 公证

`build/notarize.js` 的行为：

- 非 macOS 直接跳过。
- 本机打包（非 CI）跳过，不要求本机凭据。
- CI 上缺少 `APPLE_ID` 或 `APPLE_ID_PASS` 时打印告警并跳过。
- 公证失败只记录错误，不阻断出包，产物可人工验证。

需要正式签名与公证时，在流水线注入这两个环境变量，并确认 `build/entitlements.mac.plist` 与 `appId` 与应用一致。

## Windows 7 约束

- Electron 固定 `22.3.27`，这是最后支持 Windows 7 的发行线。升级 Electron 会直接失去 Win7 支持，属于重大变更。
- 该版本已停止安全维护，安全边界由应用层承担：渲染层沙箱、关闭 Node 集成、预加载白名单、内嵌页按主机名放行、权限与下载拒绝。改动安全策略前先读[开发指南](./development)的安全边界一节。
- 安装包为 NSIS，安装后应用目录可能位于受管控路径，因此运行期数据一律写用户数据目录，不写安装目录。

## 构建期注入

- 内容安全策略：`electron.vite.config.ts` 中的 `doPolicy()` 在 `build` 命令下把 `<!-- 内容安全策略 -->` 替换为正式的 CSP meta，开发模式保持放宽以兼容热更新。
- 主进程与预加载使用 `bytecodePlugin`，产物为字节码，减少源码直接可读性。
- 渲染层通过 `unplugin-vue-components` 按需引入 Element Plus，不需要在入口全量注册。

## 常见问题

**打包报找不到 Electron 发行包**：确认 `node_modules/electron/dist` 存在，可先执行 `pnpm install` 再出包。`electronDist` 指向本地目录，不依赖网络下载。

**出包体积异常变大**：检查是否新增了未排除的顶层目录，或把文档、脚本、测试数据打进了 `files`。

**Windows 安装后配置写不进去**：说明程序把数据写到了安装目录。运行期路径必须经 `doEnv.localDir`（用户数据目录）解析，不要用可执行文件同级目录。

**macOS 产物提示未公证**：本机出包本就不公证；CI 上确认 `APPLE_ID`、`APPLE_ID_PASS` 已配置，且以真实应用标识提交。

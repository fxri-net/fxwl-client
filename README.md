<p align="center">
  <img src="./docs/public/logo.png" width="128" alt="方弦物联：桌面终端">
</p>

# 方弦物联：桌面终端

[![CI](https://github.com/fxri-net/fxwl-client/actions/workflows/ci.yml/badge.svg)](https://github.com/fxri-net/fxwl-client/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/fxri-net/fxwl-client)](https://github.com/fxri-net/fxwl-client/releases)
[![Windows 7+](https://img.shields.io/badge/windows-7%2B-blue)](./docs/getting-started.md)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-blue)](./LICENSE)

网页程序桌面展示终端：安装后填入一个网页地址，即可把网页变成桌面应用——开机自启、自动全屏、窗口置顶、悬浮导航，只开发网页端也能拿到原生体验。

> 国内网络建议优先 [Gitee 镜像](https://gitee.com/fxri/fxwl-client)（与 GitHub 同源同步）；问题反馈走 [GitHub Issues](https://github.com/fxri-net/fxwl-client/issues) 或 [Gitee Issues](https://gitee.com/fxri/fxwl-client/issues)。

> 适用场景：展厅大屏、门店看板、值班大屏、内部系统外壳、需要开机即用的网页应用。窗口无系统边框，操作入口收敛为底部动作栏与悬浮导航胶囊。

## ✨ 能力矩阵

| 能力 | 说明 |
| --- | --- |
| 网页内嵌 | 载入任意 `http` / `https` 地址，并为其提供原生窗口外壳 |
| 展示行为 | 开机自启、自动全屏、窗口置顶，按现场习惯逐项开关 |
| 悬浮导航 | 导航胶囊可停放四角，闲置自动半透明；`Alt+←` 返回、`Esc` 回首页、鼠标侧键映射 |
| 本地站点 | 内置静态服务，可直接托管随应用分发的网页目录 |
| 快捷配置 | 首页配置页分三组，改动即时生效并自动落盘 |
| 旧版迁移 | 自动把旧版本同级数据目录迁移到用户数据目录，失败可回退 |
| 跨平台安装包 | Windows（含 7）、macOS、Linux 三平台安装包由同一套配置产出 |

## 🖥️ 运行环境

| 项目 | 要求 |
| --- | --- |
| 操作系统 | Windows 7 SP1 及以上、macOS、Linux（x64） |
| 内嵌页面 | `http` 或 `https` 地址，且可被本机访问 |

⚠️ 为兼容 Windows 7，应用固定在 Electron 22 版本线，该版本线已停止安全维护；安全边界由应用层策略承担，详见[开发指南](https://fxri-net.github.io/fxwl-client/development#安全边界)。

## 📦 下载与安装

安装包随版本发布在 Releases 页面：

```text
https://github.com/fxri-net/fxwl-client/releases
https://gitee.com/fxri/fxwl-client/releases
```

Windows 提供 NSIS 安装包（可选安装目录、默认建桌面快捷方式），macOS 提供磁盘映像，Linux 提供 AppImage / deb / snap。

## 🚀 快速上手

1. 安装并启动，进入「配置项 → 客户端」，在「页面地址（HTTP）」填入网页地址。
2. 回到首页点「客户端」卡片，即可看到内嵌页面。
3. 按现场需要到「配置项 → 面板」调整窗口尺寸、开机自启、全屏与置顶。

完整步骤见[快速开始](https://fxri-net.github.io/fxwl-client/getting-started)。

## 📚 文档

在线文档站：**<https://fxri-net.github.io/fxwl-client/>**

| 文档 | 适合谁 |
| --- | --- |
| [快速开始](./docs/getting-started.md) | 第一次接触：安装、首次启动、接上网页 |
| [使用手册](./docs/manual.md) | 日常照着用：页面结构、动作栏、导航胶囊、快捷键 |
| [配置说明](./docs/config.md) | 查字段：默认值、取值范围、生效方式 |
| [构建与打包](./docs/build.md) | 自己出包：三平台产物、命名规则、常见问题 |
| [开发指南](./docs/development.md) | 参与开发：目录结构、契约分层、扩展新字段与新通道 |
| [常见问题](./docs/faq.md) | 排障：加载失败、错误码、权限限制、端口占用 |
| [更新日志](./CHANGELOG.md) | 查各版本变更内容 |

## 📄 版权信息

作者：唐启云 <tqy@fxri.net>

出品：方弦研究所

版权：Copyright © 2023-2026 唐启云. All rights reserved.

网站：[方弦研究信息网](https://www.fxri.net)

协议：[Apache License 2.0](./LICENSE)

商标："方弦®"为第42类注册商标（注册号89648411），本开源许可不授予商标使用权，详见 [TRADEMARK.md](./TRADEMARK.md)

> 方弦研究所为唐启云个人项目品牌与出品方，非独立法人实体；本软件著作权归唐启云所有。

本项目包含的第三方源码和二进制文件之版权信息另行标注。

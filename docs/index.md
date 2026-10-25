---
layout: home
# 首页无正文 H1，显式给 title 避免浏览器标签出现重复站点名
title: 网页即桌面应用

hero:
  name: 方弦物联：桌面终端
  text: 网页即桌面应用
  tagline: 网页端只写一份，接入桌面终端即获得原生级展示能力：开机自启、全屏置顶、悬浮导航与安全内嵌，Windows 7 起可用。
  actions:
    - theme: brand
      text: 快速开始
      link: ./getting-started
    - theme: alt
      text: 使用手册
      link: ./manual
    - theme: alt
      text: GitHub
      link: https://github.com/fxri-net/fxwl-client

features:
  - icon: 🔌
    title: 一个地址即接入
    details: 填好网页的 HTTP 地址就能当桌面应用运行，无需改动网页端代码，也无需为桌面端单独开发。
  - icon: 🖥️
    title: 展示态开箱即用
    details: 开机自启、全屏、无边框、置顶、强制置顶全部是配置项，展厅大屏装完配上即可长期无人值守。
  - icon: 🧭
    title: 悬浮导航胶囊
    details: 导航贴四角任意停靠，平时完全隐藏，鼠标移入贴边热区或键盘聚焦才显现，展示内容之外不留常驻元素。
  - icon: 🛡️
    title: 内嵌页安全边界
    details: 按配置主机名放行、独立会话分区、权限与下载默认拒绝、站外链接交给系统浏览器，内嵌页拿不到桌面能力。
  - icon: 🗂️
    title: 配置自动迁移
    details: 升级后旧配置与站点目录自动迁入用户数据目录，迁移失败自动回退旧目录，不会把应用卡在启动阶段。
  - icon: 📦
    title: 三平台统一出包
    details: Windows 安装包、macOS 磁盘映像、Linux 多格式产物由同一套命令产出，验收命令本地与流水线共用。
---

## 30 秒上手

安装依赖后直接以开发模式启动，改配置即可看到展示效果：

::: code-group

```sh [pnpm]
pnpm install
pnpm dev
```

```sh [npm]
npm install
npm run dev
```

:::

启动后按「配置项 → 面板」设定窗口尺寸与展示行为，再到「配置项 → 客户端」填入网页地址，首页点「客户端」即进入内嵌页。

想直接安装使用，见[快速开始](./getting-started)。

## 解决什么痛点

| 痛点 | 本终端的做法 |
| --- | --- |
| 网页端已经做完，展厅 / 大屏还需要一套桌面壳 | 只需填一个 HTTP 地址，网页立刻以桌面应用形态运行，网页端不用为桌面端改造 |
| 大屏要求开机即亮、全屏、不被其它窗口盖住 | 开机自启、全屏、无边框、置顶、强制置顶都是配置项，装完配置一次即可长期无人值守 |
| 网页里的外链、下载、摄像头把桌面壳变成不安全入口 | 内嵌页按主机名白名单放行、独立会话分区，权限与下载默认拒绝，站外链接交给系统浏览器 |
| 常驻导航栏压住网页内容，遮挡关键信息 | 导航胶囊只在鼠标移入贴边热区时显现，其余时间完全隐藏，展示内容之外无任何常驻元素 |
| 升级版本后旧配置和本地站点目录不见了 | 首次启动自动迁移旧数据并写迁移标记，失败回退旧目录继续启动，两种结果都不会丢失配置 |

## 文档索引

| 文档 | 适合谁 |
| --- | --- |
| [快速开始](./getting-started) | 第一次安装，想尽快把网页跑进桌面 |
| [使用手册](./manual) | 日常操作：配置页、内嵌页、导航胶囊、快捷键 |
| [配置说明](./config) | 查字段含义、默认值、取值范围与生效方式 |
| [开发指南](./development) | 了解目录结构、契约分层、状态三分与安全边界 |
| [构建与打包](./build) | 本地构建、三平台出包与 Win7 约束 |
| [常见问题](./faq) | 遇到问题先来这里找 |
| [更新日志](./changelog) | 查各版本变更内容 |

## 运行环境

- 运行端：Windows 7 SP1 及以上、macOS、Linux（x64）
- 开发端：Node.js >= 20（仓库锁定 20.20.2）、pnpm 10
- 内嵌页面：仅支持 `http` 与 `https` 地址

## 相关仓库文件

- [README](https://github.com/fxri-net/fxwl-client/blob/main/README.md)：项目定位与获取方式
- [CHANGELOG](https://github.com/fxri-net/fxwl-client/blob/main/CHANGELOG.md)：完整变更历史原文
- [TRADEMARK](https://github.com/fxri-net/fxwl-client/blob/main/TRADEMARK.md)：商标使用说明

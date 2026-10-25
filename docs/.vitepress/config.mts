import { defineConfig } from "vitepress"

/** 站点名称，同时用于导航栏品牌与浏览器标题后缀 */
const SITE_NAME = "方弦物联：桌面终端"

/** 站点简介，同时用于 SEO 与社交分享摘要 */
const SITE_DESC = "把任意网页程序装进桌面：开机自启、全屏置顶、悬浮导航与安全内嵌，Windows 7 起可用。"

// 站点基础路径：默认按 GitHub Pages 的子路径 /fxwl-client/，其他托管链路经 VITEPRESS_BASE 覆盖
const base = process.env.VITEPRESS_BASE || "/fxwl-client/"

// GitHub 主仓库：社交链接与默认编辑回链共用（对外主渠道，不随部署平台变）
const githubRepo = "https://github.com/fxri-net/fxwl-client"

// 站点规范地址（sitemap 与 og 标签用）与回链仓库：默认 GitHub Pages，其他托管链路经环境变量注入，
// 值由对应流水线的变量提供，只出现在构建产物里，不进仓库源码
const siteUrl = process.env.SITE_URL || "https://fxri-net.github.io" + base
const repo = process.env.REPO_URL || githubRepo

// 编辑回链路径随托管平台不同：GitLab 多一段 /-/
const editPath = repo.indexOf("gitlab") >= 0 ? "/-/edit/main/docs/:path" : "/edit/main/docs/:path"

export default defineConfig({
  lang: "zh-CN",
  // title 同时控制浏览器标签页与导航栏品牌名（logo 旁显示）
  title: SITE_NAME,
  // 内页标签统一为「当前页 - 方弦物联：桌面终端」
  titleTemplate: ":title - " + SITE_NAME,
  description: SITE_DESC,
  base,
  // 顶级开关：按 git 提交时间生成「最后更新于」，检出需完整历史
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", href: `${base}logo.png` }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: SITE_NAME }],
    ["meta", { property: "og:title", content: SITE_NAME }],
    ["meta", { property: "og:description", content: SITE_DESC }],
    // og:image 必须为绝对地址，社交平台据此抓取分享卡片
    ["meta", { property: "og:image", content: `${siteUrl}logo.png` }],
    ["meta", { property: "og:url", content: siteUrl }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }]
  ],
  // 生成 sitemap.xml；hostname 带 base 子路径，保证各页 URL 拼接正确
  sitemap: { hostname: siteUrl },
  themeConfig: {
    // 导航栏 logo（字符串路径由 VitePress 自动拼接 base 前缀）
    logo: "/logo.png",
    nav: [
      { text: "指南", link: "/getting-started" },
      { text: "使用手册", link: "/manual" },
      {
        text: "参考",
        items: [
          { text: "配置说明", link: "/config" },
          { text: "构建与打包", link: "/build" }
        ]
      },
      { text: "开发", link: "/development" },
      { text: "FAQ", link: "/faq" },
      { text: "更新日志", link: "/changelog" }
    ],
    sidebar: [
      {
        text: "开始",
        items: [
          { text: "首页", link: "/" },
          { text: "快速开始", link: "/getting-started" },
          { text: "使用手册", link: "/manual" }
        ]
      },
      {
        text: "参考",
        items: [
          { text: "配置说明", link: "/config" },
          { text: "构建与打包", link: "/build" },
          { text: "开发指南", link: "/development" }
        ]
      },
      {
        text: "答疑",
        items: [
          { text: "常见问题", link: "/faq" },
          { text: "更新日志", link: "/changelog" }
        ]
      }
    ],
    // 本地搜索 + 中文界面文案
    search: {
      provider: "local",
      options: {
        translations: {
          button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
          modal: {
            noResultsText: "未找到相关结果",
            resetButtonTitle: "清除查询条件",
            footer: { selectText: "选择", navigateText: "切换", closeText: "关闭" }
          }
        }
      }
    },
    outline: { level: [2, 3], label: "本页目录" },
    docFooter: { prev: "上一篇", next: "下一篇" },
    lastUpdated: { text: "最后更新于" },
    // 页脚「在平台上编辑此页」跳转目标
    editLink: {
      pattern: repo + editPath,
      text: "在平台上编辑此页"
    },
    // 全站页脚
    footer: {
      message: "Apache License 2.0 开源协议",
      copyright: "Copyright © 2023-2026 唐启云"
    },
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    socialLinks: [{ icon: "github", link: githubRepo }]
  }
})

import { defineConfig, externalizeDepsPlugin, bytecodePlugin } from "electron-vite"
import vue from "@vitejs/plugin-vue"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import inject from "@rollup/plugin-inject"
import path from "path"
import type { Plugin } from "vite"

/** 共享层路径，主进程、预加载与渲染层共用 */
const shared = path.resolve(__dirname, "src/shared")

/** 生产环境内容安全策略：页面只允许加载自身资源，内联样式供运行时样式注入使用 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self' file:",
  "script-src 'self' file:",
  "style-src 'self' file: 'unsafe-inline'",
  "img-src 'self' file: data: blob: https:",
  "font-src 'self' file: data:",
  "connect-src 'self' file: ws: wss:",
  "media-src 'self' file: data: blob:",
  "frame-src 'self' file: http: https:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'"
].join("; ")

/** 注入内容安全策略：只在构建产物里注入，开发模式保持放宽以兼容热更新 @return 插件实例 */
function doPolicy(): Plugin {
  /** 是否为构建命令 */
  let build = false
  return {
    name: "fxwl-policy",
    configResolved: function (config) {
      build = config.command == "build"
    },
    transformIndexHtml: {
      order: "pre",
      handler: function (html) {
        if (!build) return html
        return html.replace("<!-- 内容安全策略 -->", '<meta http-equiv="Content-Security-Policy" content="' + CONTENT_SECURITY_POLICY + '">')
      }
    }
  }
}

export default defineConfig({
  // 主程序
  main: {
    // 插件数组
    plugins: [externalizeDepsPlugin(), bytecodePlugin()],
    // 解决方案
    resolve: {
      alias: {
        "@shared": shared
      }
    }
  },
  // 预加载脚本
  preload: {
    // 插件数组
    plugins: [externalizeDepsPlugin(), bytecodePlugin()],
    // 解决方案
    resolve: {
      alias: {
        "@shared": shared
      }
    }
  },
  // 渲染器
  renderer: {
    // 插件数组
    plugins: [
      doPolicy(),
      vue(),
      AutoImport({
        imports: ["vue"],
        dirs: ["./src/libs"],
        dts: "src/auto-imports.d.ts"
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: "src/components.d.ts"
      }),
      inject({
        // 这里会自动载入 node_modules 中的 jquery jquery全局变量
        $: "jquery",
        jQuery: "jquery",
        "windows.jQuery": "jquery"
      })
    ],
    // 解决方案
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src/renderer/src"),
        "@shared": shared
      }
    },
    // 服务器配置
    server: {
      host: "0.0.0.0",
      port: 2601
    }
  }
})

import { defineConfig, externalizeDepsPlugin, bytecodePlugin } from "electron-vite"
import vue from "@vitejs/plugin-vue"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import inject from "@rollup/plugin-inject"
import path from "path"

/** 共享层路径，主进程、预加载与渲染层共用 */
const shared = path.resolve(__dirname, "src/shared")

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

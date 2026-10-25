import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "@/App.vue"
import router from "@/router/index"
import { useBridge } from "@/composables/useBridge"
import "@/styles/tokens.scss"
import "@/styles/base.scss"

// 初始化应用
const app = createApp(App)
// 挂载状态管理
app.use(createPinia())
// 组件与样式由 unplugin-vue-components 按需引入，不做全量注册
// 接入原生配置，水合完成后再接入路由，保证初始化跳转读到磁盘配置
useBridge().then(function () {
  app.use(router)
  // 启动应用
  app.mount("#app")
})

import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "@/App.vue"
import router from "@/router/index"
import elementPlus from "element-plus"
import { initBase } from "@/libs/base"
import { initStore } from "@/stores"
import "element-plus/dist/index.css"
import "@/styles/base.scss"

// 初始化应用
const app = createApp(App)
// 挂载状态管理
app.use(createPinia())
// 启动应用
app.use(router)
app.use(elementPlus)
// 回填状态与基础数据
initStore()
initBase()
app.mount("#app")

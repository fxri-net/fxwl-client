import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "@/App.vue"
import router from "@/router/index"
import elementPlus from "element-plus"
import { useBridge } from "@/composables/useBridge"
import "element-plus/dist/index.css"
import "@/styles/base.scss"

// 初始化应用
const app = createApp(App)
// 挂载状态管理
app.use(createPinia())
// 启动应用
app.use(router)
app.use(elementPlus)
// 接入原生配置
useBridge()
app.mount("#app")

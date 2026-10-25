import App from "@/App.vue"
import router from "@/router/index"
import elementPlus from "element-plus"
import "element-plus/dist/index.css"
import "@/styles/base.scss"

// 初始化应用
const app = createApp(App)
// 启动应用
app.use(router)
app.use(elementPlus)
app.mount("#app")

import App from "@/App.vue"
import router from "@/router/index"
import store from "@/stores/index"
import elementPlus from "element-plus"
import VueLazyload from "vue-lazyload"
import "element-plus/dist/index.css"
import "@/styles/base.scss"

// 初始化应用
const app = createApp(App)
// 启动应用
app.use(router)
app.use(store)
app.use(elementPlus)
app.use(VueLazyload)
app.mount("#app")

/**
 * createRouter 这个为创建路由的方法
 * createWebHashHistory 这个就是vue2中路由的模式，
 *                      这里的是hash模式，这个还可以是createWebHistory等
 * RouteRecordRaw 这个为要添加的路由记录，也可以说是routes的ts类型
 */
import {
  createRouter,
  // createWebHistory,
  createWebHashHistory,
  RouteRecordRaw,
  useRouter,
  useRoute
} from "vue-router"
// 路由记录
const routes: Array<RouteRecordRaw> = [
  {
    path: "/:catchAll(.*)",
    redirect: "/"
  },
  {
    path: "/",
    name: "index",
    meta: { title: "首页" },
    component: () => import("@/views/index/Index.vue")
  },
  {
    path: "/config",
    name: "config",
    meta: { title: "配置项" },
    component: () => import("@/views/index/Config.vue")
  },
  {
    path: "/client/index",
    name: "client/index",
    meta: { title: "客户端" },
    component: () => import("@/views/client/Index.vue")
  }
]
// 匹配根路径
const config: any = {}
$.each(routes.reverse(), function (_key, value) {
  // 疏理配置
  config.path = window.location.pathname
  config.index = config.path.lastIndexOf(value.path)
  // 疏理根路径
  if (config.index !== -1) {
    config.base = config.path.substring(0, config.index)
    return false
  }
  return true
})
// 创建路由
const router = createRouter({
  // history: createWebHistory(config.base),
  history: createWebHashHistory(),
  routes
})
// 路由跳转前
router.beforeEach((to, _from, next) => {
  // 配置标题
  document.title = String(to.meta.title) + " - " + imStore.app.title.value
  // 跳转下一页
  next()
})
// 路由跳转后
router.afterEach(() => {
  // 疏理路由器
  imView.router = useRouter()
  // 疏理路由
  $.each(useRoute().query, function (key, value) {
    imApp.param.value[key] = value
  })
  // 初始化页面
  if (!imApp.init) {
    // 跳转默认页面
    doView.jump(imStore.app.url_default.value)
    // 完成初始化
    imApp.init = true
  }
})
export default router

// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { createRouter, createWebHashHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"
import { imApp, imView } from "@/libs/base"
import { isUrl } from "@/libs/is"
import { doView } from "@/libs/nav"
import { imStore } from "@/stores"

declare module "vue-router" {
  /** 路由元信息 */
  interface RouteMeta {
    /** 页面标题 */
    title?: string
    /** 是否需要执行初始跳转 */
    init?: boolean
  }
}

/** 路由记录 */
const routes: Array<RouteRecordRaw> = [
  {
    path: "/:catchAll(.*)",
    redirect: "/"
  },
  {
    path: "/",
    name: "index",
    meta: { title: "首页", init: true },
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

/** 路由器 */
const router = createRouter({
  // 窗口直接加载本地文件，hash 模式无需 base
  history: createWebHashHistory(),
  routes
})

// 供业务层发起跳转
imView.router = router

// 路由跳转前
router.beforeEach(function (to) {
  // 首次进入首页时切到默认页面，仅执行一次
  if (!to.meta.init || imApp.init) return true
  imApp.init = true
  /** 默认页面 */
  const url = imStore.app.url_default
  if (!url || url === to.path) return true
  // 外部链接交给浏览器加载，中断本次应用内导航
  if (isUrl(url)) {
    doView.jump(url)
    return false
  }
  return url
})

// 路由跳转后
router.afterEach(function (to) {
  // 配置标题
  document.title = (to.meta.title ? to.meta.title + " - " : "") + imStore.app.title
  // 收集页面参数
  Object.keys(to.query).forEach(function (key) {
    imApp.param.value[key] = to.query[key]
  })
})

export default router

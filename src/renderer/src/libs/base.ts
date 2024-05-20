// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import store from "@/utils/store"
import { Router } from "vue-router"
/** 应用 */
export const imApp: {
  /** 初始化 */
  init: boolean
  /** 应用时钟 */
  clock: globalThis.Ref<string>
  /** 应用参数 */
  param: globalThis.Ref
  /** 通信服务 */
  socket?: WebSocket
} = {
  init: false,
  clock: ref(""),
  param: ref({})
}
/** 监听应用参数 */
doParam.watch("param", imApp)
/** 存储 */
export const imStore = {
  /** 应用 */
  app: toRefs(reactive(store.app.data)),
  /** 面板 */
  panel: toRefs(reactive(store.panel.data)),
  /** 客户端 */
  client: toRefs(reactive(store.client.data))
}
/** 视图 */
export const imView: {
  /** 路由器 */
  router?: Router
  /** 缩放比例 */
  scale: globalThis.Ref<string>
  /** 数据部署 */
  deploy: globalThis.Ref
} = {
  scale: ref(""),
  deploy: ref({})
}
/** 监听数据部署 */
doParam.watch("deploy", imView)

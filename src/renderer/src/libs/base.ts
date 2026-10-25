// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import type { Ref } from "vue"
import { ref } from "vue"
import type { Router } from "vue-router"
/** 应用 */
export const imApp: {
  /** 初始化 */
  init: boolean
  /** 应用时钟 */
  clock: Ref<string>
  /** 应用参数 */
  param: Ref
  /** 通信服务 */
  socket?: WebSocket
} = {
  init: false,
  clock: ref(""),
  param: ref({})
}
/** 视图 */
export const imView: {
  /** 路由器 */
  router?: Router
  /** 缩放比例 */
  scale: Ref<string>
  /** 数据部署 */
  deploy: Ref
} = {
  scale: ref(""),
  deploy: ref({})
}

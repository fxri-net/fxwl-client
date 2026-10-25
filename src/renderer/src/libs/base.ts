// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import type { StoreScope } from "@shared/defines"
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
/** 存储 */
export const imStore = {
  /** 应用 */
  app: store.app.store,
  /** 面板 */
  panel: store.panel.store,
  /** 客户端 */
  client: store.client.store
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
// 监听应用参数
doParam.watch("param", imApp.param)
// 监听数据部署
doParam.watch("deploy", imView.deploy)
// 配置联动存储
$.each(imStore, function (key) {
  /** 存储范围 */
  const scope = key as StoreScope
  // 本地数据
  window.doNative != undefined &&
    doNative.config.get(scope).then(function (res) {
      if (res == undefined) {
        doData.merge("ref|mix", imStore[key], store[key].data)
      }
      $.each(res, function (key2, value2) {
        imStore[key][key2].value = value2
      })
    })
  // 监听存储
  watch(
    imStore[key],
    (data) => {
      window.doNative != undefined && doNative.config.set(scope, JSON.parse(JSON.stringify(data)))
    },
    { deep: true }
  )
})

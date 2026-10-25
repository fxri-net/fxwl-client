// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import type { Ref } from "vue"
import { ref, watch } from "vue"
import type { Router } from "vue-router"
import type { StoreScope } from "@shared/defines"
import { STORE_SCOPES } from "@shared/defines"
import { doData } from "@/libs/obj"
import { doParam } from "@/libs/module"
import store from "@/utils/store"
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
  scale: Ref<string>
  /** 数据部署 */
  deploy: Ref
} = {
  scale: ref(""),
  deploy: ref({})
}
// 监听应用参数
doParam.watch("param", imApp.param)
// 监听数据部署
doParam.watch("deploy", imView.deploy)
// 配置联动存储
STORE_SCOPES.forEach(function (scope: StoreScope) {
  // 本地数据
  window.doNative != undefined &&
    doNative.config.get(scope).then(function (res) {
      if (res == undefined) {
        doData.merge("ref|mix", imStore[scope], store[scope].data)
      }
      // 逐个回填已持久化的字段
      Object.keys(res ?? {}).forEach(function (key) {
        /** 存储中同名的字段值 */
        const value = (res as Record<string, unknown>)[key]
        /** 内存中对应的字段 */
        const item = (imStore[scope] as Record<string, unknown>)[key] as { value: unknown } | undefined
        item && (item.value = value)
      })
    })
  // 监听存储
  watch(
    imStore[scope],
    (data) => {
      window.doNative != undefined && doNative.config.set(scope, JSON.parse(JSON.stringify(data)))
    },
    { deep: true }
  )
})

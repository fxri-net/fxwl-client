// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { watch } from "vue"
import type { StoreScope } from "@shared/defines"
import { STORE_SCOPES } from "@shared/defines"
import { doParam } from "@/libs/module"
import { doData } from "@/libs/obj"
import { useAppStore } from "@/stores/app"
import { useClientStore } from "@/stores/client"
import { usePanelStore } from "@/stores/panel"
/** 存储定义 */
export const imScope = {
  /** 应用存储 */
  app: useAppStore,
  /** 客户端存储 */
  client: useClientStore,
  /** 面板存储 */
  panel: usePanelStore
}
/** 存储视图 */
export const imStore = {
  /** 应用数据 */
  get app() {
    return useAppStore().datas
  },
  /** 客户端数据 */
  get client() {
    return useClientStore().datas
  },
  /** 面板数据 */
  get panel() {
    return usePanelStore().datas
  }
}
/**
 * 初始化存储
 * @example initStore()
 */
export function initStore(): void {
  STORE_SCOPES.forEach(function (scope: StoreScope) {
    /** 当前数据 */
    const datas = imStore[scope] as Record<string, unknown>
    // 回填本地缓存并持续同步
    doParam.watch(scope, datas)
    // 回填本地配置
    window.doNative != undefined &&
      doNative.config.get(scope).then(function (res) {
        /** 与内存结构对齐的配置 */
        const data = Object.keys(datas).reduce<Record<string, unknown>>(function (acc, key) {
          // 配置侧独有字段不进入视图
          key in res && (acc[key] = res[key])
          return acc
        }, {})
        doData.merge("ref|mix", datas, data)
      })
    // 数据变更写入本地配置
    watch(
      datas,
      function () {
        window.doNative != undefined && doNative.config.set(scope, JSON.parse(JSON.stringify(datas)))
      },
      { deep: true }
    )
  })
}

// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { nextTick, watch } from "vue"
import type { StoreScope } from "@shared/defines"
import { STORE_SCOPES } from "@shared/defines"
import { doInfo } from "@/libs/module"
import { doData } from "@/libs/obj"
import { imStore } from "@/stores"
/** 写入防抖时长（毫秒） */
const BRIDGE_DELAY = 500
/** 待写入计时器 */
const timers: Partial<Record<StoreScope, number>> = {}
/**
 * 立即写入存储
 * @return 写入结果
 * @example await flushBridge()
 */
export async function flushBridge(): Promise<void> {
  // 等待本轮数据变更触发的监听入队，避免漏掉刚发生的重置
  await nextTick()
  /** 待写入的范围 */
  const scopes = Object.keys(timers) as StoreScope[]
  scopes.forEach(function (scope) {
    window.clearTimeout(timers[scope])
    delete timers[scope]
  })
  await Promise.all(scopes.map(saveScope))
}
/**
 * 水合存储
 * @param scope 存储范围
 * @return 水合结果
 */
function hydrateScope(scope: StoreScope): Promise<void> {
  /** 当前数据 */
  const datas = imStore[scope] as Record<string, unknown>
  // 纯浏览器环境没有原生通道
  if (window.doNative == undefined) return Promise.resolve()
  return window.doNative.config.get(scope).then(function (res) {
    /** 与内存结构对齐的配置 */
    const data = Object.keys(datas).reduce<Record<string, unknown>>(function (acc, key) {
      // 配置侧独有字段不进入视图
      key in res && (acc[key] = res[key])
      return acc
    }, {})
    doData.merge("ref|mix", datas, data)
  })
}
/**
 * 写入存储
 * @param scope 存储范围
 * @return 写入结果
 */
function saveScope(scope: StoreScope): Promise<void> {
  /** 当前数据 */
  const datas = imStore[scope] as Record<string, unknown>
  // 纯浏览器环境没有原生通道
  if (window.doNative == undefined) return Promise.resolve()
  // 脱去响应式代理，避免把代理对象交给跨进程通道
  return window.doNative.config.set(scope, JSON.parse(JSON.stringify(datas))).catch(function (err) {
    // 保留内存态并提示，避免静默丢数据
    doInfo.message({ type: "error", message: "配置保存失败（" + scope + "）：" + String(err) })
  })
}
/**
 * 桥接存储
 * @example useBridge()
 */
export function useBridge(): void {
  // 纯浏览器环境没有原生通道
  if (window.doNative == undefined) return
  STORE_SCOPES.forEach(function (scope: StoreScope) {
    // 水合成功后再监听，避免默认值覆盖磁盘配置
    hydrateScope(scope).then(
      function () {
        watchScope(scope)
      },
      function (err) {
        doInfo.message({ type: "error", message: "配置读取失败（" + scope + "），本次修改不会被保存：" + String(err) })
      }
    )
  })
}
/**
 * 监听存储
 * @param scope 存储范围
 */
function watchScope(scope: StoreScope): void {
  /** 当前数据 */
  const datas = imStore[scope] as Record<string, unknown>
  watch(
    datas,
    function () {
      // 合并短时间内的连续变更，只保留一次整体回写
      window.clearTimeout(timers[scope])
      timers[scope] = window.setTimeout(function () {
        delete timers[scope]
        saveScope(scope)
      }, BRIDGE_DELAY)
    },
    { deep: true }
  )
}

// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { reactive } from "vue"
import { defineStore } from "pinia"
import { doData } from "@/libs/obj"
/** 默认数据 */
const defaults = {
  /** 窗口 */
  window: {
    /** 宽度 */
    width: 1280,
    /** 高度 */
    height: 720,
    /** 左边距 */
    x: "center" as number | string,
    /** 上边距 */
    y: "center" as number | string,
    /** 全屏 */
    fullscreen: false,
    /** 无边框 */
    frame: false,
    /** 置顶 */
    isTop: false,
    /** 强制置顶 */
    isFocus: false,
    /** 开机自启 */
    startup: false,
    /** HTTP缓存 */
    http_cache: true
  },
  /** 服务器 */
  server: {
    /** 开关 */
    switch: false,
    /** 目录 */
    dir: "website",
    /** 端口 */
    port: "2602",
    /** 端口占用提示 */
    port_prompt: false
  }
}
/** 面板存储 */
export const usePanelStore = defineStore("panel", function () {
  /** 数据集合 */
  const datas = reactive(doData.clone(defaults) as typeof defaults)
  /** 重置数据 */
  function reset(): void {
    // 回填出厂值
    doData.merge("ref|mix", datas, defaults)
  }
  return { datas, reset }
})

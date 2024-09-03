// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
/** 数据 */
const data: {
  /** 窗口 */
  window: {
    /** 宽度 */
    width: number
    /** 高度 */
    height: number
    /** 左边距 */
    x: number | string
    /** 上边距 */
    y: number | string
    /** 全屏 */
    fullscreen: boolean
    /** 无边框 */
    frame: boolean
    /** 置顶 */
    isTop: boolean
    /** 强制置顶 */
    isFocus: boolean
    /** 开机自启 */
    startup: boolean
    /** HTTP缓存 */
    http_cache: boolean
  }
  /** 服务器 */
  server: {
    /** 开关 */
    switch: boolean
    /** 目录 */
    dir: string
    /** 端口 */
    port: string
    /** 端口占用提示 */
    port_prompt: boolean
  }
} = {
  window: {
    width: 1280,
    height: 720,
    x: "center",
    y: "center",
    fullscreen: false,
    frame: false,
    isTop: false,
    isFocus: false,
    startup: false,
    http_cache: true
  },
  server: {
    switch: false,
    dir: "website",
    port: "2602",
    port_prompt: false
  }
}
/** 存储 */
const store = reactive(doData.clone(data) as typeof data)
// 监听存储
doParam.watch("panel", store)
// 导出存储
export default { data, store }

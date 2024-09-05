// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
/** 数据 */
const data = {
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
/** 存储 */
const store = reactive(doData.clone(data) as typeof data)
// 监听存储
doParam.watch("panel", store)
// 导出存储
export default { data, store }

// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import type { LocationQueryRaw } from "vue-router"
import { imView } from "@/libs/base"
import { isUrl } from "@/libs/is"
import { imStore } from "@/stores"
/** 视图模块 */
export const doView = {
  /** 跳转页面 */
  jump: function (url: string, param?: LocationQueryRaw): void {
    // 检查url
    if (!isUrl(url)) {
      imView.router && imView.router.push({ path: url, query: param })
    } else {
      window.location.href = url
    }
  },
  /** 计算缩放 */
  scale: function (width: number, height: number, boxW?: number, boxH?: number): string {
    // 根容器尺寸兜底，缺失时按目标尺寸铺满
    /** 根容器 */
    const root = document.getElementById("app")
    /** 实际宽度 */
    const realW = boxW || root?.clientWidth || width
    /** 实际高度 */
    const realH = boxH || root?.clientHeight || height
    // 计算缩放
    return "transform: scale(" + realW / width + ", " + realH / height + ")"
  },
  /** 处理URL */
  url: function (url: string): string {
    // 检查url
    if (!isUrl(url)) {
      url = imStore.client.url_host + url
    }
    return url
  }
}

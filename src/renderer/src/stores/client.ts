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
  /** 页面地址 */
  url_host: "http://127.0.0.1:2602",
  /** 返回按钮 */
  back_btn: ""
}
/** 客户端存储 */
export const useClientStore = defineStore("client", function () {
  /** 数据集合 */
  const datas = reactive(doData.clone(defaults) as typeof defaults)
  /** 重置数据 */
  function reset(): void {
    // 回填出厂值
    doData.merge("ref|mix", datas, defaults)
  }
  return { datas, reset }
})

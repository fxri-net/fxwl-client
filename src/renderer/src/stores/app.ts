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
  /** 标题 */
  title: "方弦物联",
  /** 调试模式 */
  debug: false,
  /** 默认页面 */
  url_default: "/",
  /** 面板索引 */
  panel_index: "0"
}
/** 应用存储 */
export const useAppStore = defineStore("app", function () {
  /** 枚举集合 */
  const enums = reactive({
    /** 页面列表 */
    url_list: {
      首页: "/",
      配置项: "/config",
      客户端: "/client/index"
    },
    /** 返回按钮组 */
    back_btns: {
      "左上（默认）": "left: 0; right: auto; top: 0; bottom: auto;",
      右上: "left: auto; right: 0; top: 0; bottom: auto;",
      右下: "left: auto; right: auto; top: auto; bottom: 0;",
      左下: "left: 0; right: auto; top: auto; bottom: 0;"
    }
  })
  /** 数据集合 */
  const datas = reactive(doData.clone(defaults) as typeof defaults)
  /** 重置数据 */
  function reset(): void {
    // 回填出厂值
    doData.merge("ref|mix", datas, defaults)
  }
  return { enums, datas, reset }
})

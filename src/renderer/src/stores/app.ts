// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { reactive } from "vue"
import { defineStore } from "pinia"
import type { AppSection } from "@shared/config"
import { CONFIG_DEFAULTS } from "@shared/config"
import { doData } from "@/libs/obj"
/** 应用存储 */
export const useAppStore = defineStore("app", function () {
  /** 数据集合 */
  const datas = reactive(doData.clone(CONFIG_DEFAULTS.app) as AppSection)
  /** 重置数据 */
  function reset(): void {
    // 回填出厂值
    doData.merge("ref|mix", datas, CONFIG_DEFAULTS.app)
  }
  return { datas, reset }
})

// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { reactive } from "vue"
import { defineStore } from "pinia"
import type { PanelSection } from "@shared/config"
import { CONFIG_DEFAULTS } from "@shared/config"
import { doData } from "@/libs/obj"
/** 面板存储 */
export const usePanelStore = defineStore("panel", function () {
  /** 数据集合 */
  const datas = reactive(doData.clone(CONFIG_DEFAULTS.panel) as PanelSection)
  /** 重置数据 */
  function reset(): void {
    // 回填出厂值
    doData.merge("ref|mix", datas, CONFIG_DEFAULTS.panel)
  }
  return { datas, reset }
})

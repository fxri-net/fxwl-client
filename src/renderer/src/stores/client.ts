// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { reactive } from "vue"
import { defineStore } from "pinia"
import type { ClientSection } from "@shared/config"
import { CONFIG_DEFAULTS } from "@shared/config"
import { doData } from "@/libs/obj"
/** 客户端存储 */
export const useClientStore = defineStore("client", function () {
  /** 数据集合 */
  const datas = reactive(doData.clone(CONFIG_DEFAULTS.client) as ClientSection)
  /** 重置数据 */
  function reset(): void {
    // 回填出厂值
    doData.merge("ref|mix", datas, CONFIG_DEFAULTS.client)
  }
  return { datas, reset }
})

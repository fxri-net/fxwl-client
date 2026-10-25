// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { useAppStore } from "@/stores/app"
import { useClientStore } from "@/stores/client"
import { usePanelStore } from "@/stores/panel"
/** 存储定义 */
export const imScope = {
  /** 应用存储 */
  app: useAppStore,
  /** 客户端存储 */
  client: useClientStore,
  /** 面板存储 */
  panel: usePanelStore
}
/** 存储视图 */
export const imStore = {
  /** 应用数据 */
  get app() {
    return useAppStore().datas
  },
  /** 客户端数据 */
  get client() {
    return useClientStore().datas
  },
  /** 面板数据 */
  get panel() {
    return usePanelStore().datas
  }
}

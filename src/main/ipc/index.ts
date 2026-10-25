// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { doIpcApp } from "./app"
import { doIpcConfig } from "./config"
import { doIpcDialog } from "./dialog"
import { doIpcService } from "./service"
/** 事件模块 */
export const doIpc = {
  /** 注册事件 */
  register: function (): void {
    doIpcApp.register()
    doIpcConfig.register()
    doIpcDialog.register()
    doIpcService.register()
  }
}

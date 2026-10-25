// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { app, shell } from "electron"
import { IPC_CHANNEL } from "@shared/contract"
import { doStore } from "../service/store"
import { doHandle } from "./register"
/** 应用域事件 */
export const doIpcApp = {
  /** 注册事件 */
  register: function (): void {
    // 应用版本
    doHandle(IPC_CHANNEL.AppVersion, () => app.getVersion())
    // 重启应用
    doHandle(IPC_CHANNEL.AppRestart, () => {
      app.relaunch()
      app.quit()
    })
    // 退出应用
    doHandle(IPC_CHANNEL.AppQuit, () => app.quit())
    // 打开配置目录：openPath 失败时返回非空错误描述
    doHandle(IPC_CHANNEL.AppOpenConfigDir, async () => {
      /** 打开失败的错误描述 */
      const message = await shell.openPath(doStore.dir)
      if (message != "") throw new Error(message)
    })
  }
}

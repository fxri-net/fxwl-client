// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { dialog } from "electron"
import { IPC_CHANNEL } from "@shared/contract"
import { doWindow } from "../window"
import { doHandle } from "./register"
/** 对话框域事件 */
export const doIpcDialog = {
  /** 注册事件 */
  register: function (): void {
    // 选择目录：属性由主进程固定，渲染层只能指定标题
    doHandle(IPC_CHANNEL.DialogOpenDirectory, async function (param) {
      /** 对话框参数 */
      const option: Electron.OpenDialogOptions = { title: param?.title, properties: ["openDirectory"] }
      // 主窗口已销毁时退回无父窗口的对话框，避免挂到不存在的窗口上
      const result = doWindow.main != undefined ? await dialog.showOpenDialog(doWindow.main, option) : await dialog.showOpenDialog(option)
      if (result.canceled || result.filePaths.length <= 0) return null
      return result.filePaths[0]
    })
  }
}

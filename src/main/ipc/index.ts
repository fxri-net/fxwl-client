// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { app, dialog, ipcMain } from "electron"
import { doWindow } from "../window"
import { doStore } from "../service/store"
/** 事件模块 */
export const doIpc = {
  /** 注册事件 */
  register: function (): void {
    // 重启应用
    ipcMain.handle("restart", function (): void {
      app.relaunch()
      app.quit()
    })
    // 退出应用
    ipcMain.handle("quit", function (): void {
      app.quit()
    })
    // 数据存储
    ipcMain.handle("store", function (_event, name: "set" | "get", data: any): any {
      if (name == "set") {
        doStore.set(data)
        return
      }
      return doStore.get(data)
    })
    // 打开文件
    ipcMain.handle("openFile", async function (_event, option: Electron.OpenDialogOptions): Promise<string[] | undefined> {
      // 校验窗口
      if (doWindow.main == undefined) return
      // 打开文件
      const { canceled, filePaths } = await dialog.showOpenDialog(doWindow.main, option)
      // 返回数据
      if (canceled) return
      return filePaths
    })
  }
}

// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { BrowserWindow, shell } from "electron"
/** 安全策略 */
export const doSecurity = {
  /** 应用安全策略 @param mainWindow 主窗口 */
  apply: function (mainWindow: BrowserWindow): void {
    // 新窗口一律交给系统浏览器打开，不在应用内创建
    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: "deny" }
    })
  }
}

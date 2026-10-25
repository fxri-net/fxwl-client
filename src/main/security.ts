// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { BrowserWindow, session, shell } from "electron"
import path from "path"
import { pathToFileURL } from "url"
import { doEnv } from "./env"
/** 应用自身页面前缀：开发模式取开发服务器地址，生产模式取本地页面文件 */
const pagePrefix = doEnv.devUrl != "" ? doEnv.devUrl : pathToFileURL(path.resolve(__dirname, "../renderer/index.html")).href
/** 是否可交给系统浏览器 @param url 目标地址 @return 是否为 http 或 https 地址 */
function isExternal(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://")
}
/** 是否应用自身页面 @param url 目标地址 @return 是否站内地址 */
function isInternal(url: string): boolean {
  return url.startsWith(pagePrefix)
}
/** 安全策略 */
export const doSecurity = {
  /** 应用安全策略 @param mainWindow 主窗口 */
  apply: function (mainWindow: BrowserWindow): void {
    // 主框架只允许停留在应用自身页面，外链一律转交系统浏览器
    mainWindow.webContents.on("will-navigate", function (event, url) {
      if (isInternal(url)) return
      event.preventDefault()
      if (isExternal(url)) shell.openExternal(url)
    })
    // 新窗口一律交给系统浏览器打开，不在应用内创建
    mainWindow.webContents.setWindowOpenHandler(function (details) {
      if (isExternal(details.url)) shell.openExternal(details.url)
      return { action: "deny" }
    })
    // 权限申请默认全部拒绝，确有需要时再按来源逐项放行
    session.defaultSession.setPermissionRequestHandler(function (_webContents, _permission, callback) {
      callback(false)
    })
    // 权限查询同样默认拒绝，避免页面以查询绕过申请
    session.defaultSession.setPermissionCheckHandler(function () {
      return false
    })
  }
}

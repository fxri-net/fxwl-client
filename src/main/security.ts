// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { BrowserWindow, session, shell } from "electron"
import type { Session, WebContents } from "electron"
import path from "path"
import { pathToFileURL } from "url"
import { CLIENT_PARTITION } from "@shared/defines"
import { doEnv } from "./env"
import { doStore } from "./service/store"
/** 应用自身页面前缀：开发模式取开发服务器地址，生产模式取本地页面文件 */
const pagePrefix = doEnv.devUrl != "" ? doEnv.devUrl : pathToFileURL(path.resolve(__dirname, "../renderer/index.html")).href
/** 内嵌页会话是否已套用安全策略 */
let isGuestReady = false
/** 是否可交给系统浏览器 @param url 目标地址 @return 是否为 http 或 https 地址 */
function isExternal(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://")
}
/** 是否应用自身页面 @param url 目标地址 @return 是否站内地址 */
function isInternal(url: string): boolean {
  return url.startsWith(pagePrefix)
}
/** 解析地址 @param url 目标地址 @return 地址对象，非法地址为 null */
function parseUrl(url: string): URL | null {
  if (url == "") return null
  try {
    return new URL(url)
  } catch {
    return null
  }
}
/** 内嵌页允许的主机名：取配置中的页面地址 @return 主机名，未配置时为空白 */
function allowedHost(): string {
  const url = parseUrl(String(doStore.get("client")?.url_host ?? ""))
  return url == null ? "" : url.hostname.toLowerCase()
}
/** 是否允许内嵌页加载 @param url 目标地址 @return 是否在放行范围 */
function isAllowedGuest(url: string): boolean {
  const target = parseUrl(url)
  // 只接受 http 与 https，且主机名必须与配置一致
  if (target == null || (target.protocol != "http:" && target.protocol != "https:")) return false
  const host = allowedHost()
  return host != "" && target.hostname.toLowerCase() == host
}
/** 配置内嵌页会话：拒绝权限申请与下载 @param guestSession 内嵌页会话 */
function prepareGuestSession(guestSession: Session): void {
  // 权限申请默认全部拒绝，内嵌页不得调用摄像头、麦克风、通知等能力
  guestSession.setPermissionRequestHandler(function (_webContents, _permission, callback) {
    callback(false)
  })
  // 权限查询同样拒绝，避免内嵌页以查询探测能力
  guestSession.setPermissionCheckHandler(function () {
    return false
  })
  // 内嵌页不提供下载能力，避免绕过应用向磁盘写文件
  guestSession.on("will-download", function (event) {
    event.preventDefault()
  })
}
/** 配置内嵌页交互：外链转交系统浏览器 @param guest 内嵌页内容 */
function prepareGuest(guest: WebContents): void {
  if (!isGuestReady) {
    prepareGuestSession(guest.session)
    isGuestReady = true
  }
  // 站内跳转放行，跨站跳转交出控制权并转交系统浏览器
  guest.on("will-navigate", function (event, url) {
    if (isAllowedGuest(url)) return
    event.preventDefault()
    if (isExternal(url)) shell.openExternal(url)
  })
  // 内嵌页不创建新窗口
  guest.setWindowOpenHandler(function (details) {
    if (isExternal(details.url)) shell.openExternal(details.url)
    return { action: "deny" }
  })
  // 内嵌页销毁即清理会话数据，下次进入从干净状态开始
  guest.once("destroyed", function () {
    void guest.session.clearStorageData()
  })
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
    // 内嵌页挂载前校验地址并覆写网页偏好，页面无法借标签拿到额外能力
    mainWindow.webContents.on("will-attach-webview", function (event, webPreferences, params) {
      if (!isAllowedGuest(params.src)) {
        event.preventDefault()
        if (isExternal(params.src)) shell.openExternal(params.src)
        return
      }
      // 不加载页面自带的预加载脚本
      delete webPreferences.preload
      webPreferences.nodeIntegration = false
      webPreferences.contextIsolation = true
      webPreferences.sandbox = true
      webPreferences.webSecurity = true
      webPreferences.partition = CLIENT_PARTITION
    })
    // 内嵌页挂载后补上会话与交互策略
    mainWindow.webContents.on("did-attach-webview", function (_event, guest) {
      prepareGuest(guest)
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

// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { BrowserWindow, session, shell } from "electron"
import type { Session, WebContents } from "electron"
import path from "path"
import { pathToFileURL } from "url"
import { IPC_EVENT } from "@shared/contract"
import type { ClientShortcut } from "@shared/contract"
import { CLIENT_PARTITION } from "@shared/defines"
import { doEnv } from "./env"
import { doStore } from "./service/store"
/** 应用自身页面前缀：开发模式取开发服务器地址，生产模式取本地页面文件 */
const pagePrefix = doEnv.devUrl != "" ? doEnv.devUrl : pathToFileURL(path.resolve(__dirname, "../renderer/index.html")).href
/** 内嵌页会话是否已套用安全策略 */
let isGuestReady = false
/** 侧键脚本：Electron 22 没有鼠标钩子，只能在内嵌页内按浏览器习惯后退 */
const SIDE_BUTTON_SCRIPT =
  "window.addEventListener('mouseup', function (event) { if (event.button == 3 || event.button == 4) window.history.back() }, true)"
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
/** 输入或全屏状态下 Esc 属于页面自身交互 @param guest 内嵌页内容 @return 是否交还页面 */
function isPageBusy(guest: WebContents): Promise<boolean> {
  if (guest.isDestroyed()) return Promise.resolve(true)
  return guest
    .executeJavaScript(
      "var el = document.activeElement; document.fullscreenElement != null || (el != null && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable))"
    )
    .then(function (result: unknown) {
      return result === true
    })
    .catch(function () {
      // 页面脚本不可用时按输入态处理，避免误退出
      return true
    })
}
/** 下发快捷键 @param host 宿主页面 @param shortcut 快捷键动作 */
function sendShortcut(host: WebContents, shortcut: ClientShortcut): void {
  if (host.isDestroyed()) return
  host.send(IPC_EVENT.ClientShortcut, shortcut)
}
/** 监听内嵌页快捷键：焦点落在页面内时宿主收不到键盘事件，需由主进程转发 @param guest 内嵌页内容 @param host 宿主页面 */
function bindGuestShortcut(guest: WebContents, host: WebContents): void {
  guest.on("before-input-event", function (event, input) {
    if (input.type != "keyDown" || input.isAutoRepeat || input.isComposing) return
    // Alt+← 按浏览器习惯后退，交由渲染层执行
    if (input.alt && !input.control && !input.meta && input.key == "ArrowLeft") {
      event.preventDefault()
      sendShortcut(host, "back")
      return
    }
    if (input.key != "Escape" || input.alt || input.control || input.meta) return
    // 输入框、全屏控件内的 Esc 属于页面自身交互，交还页面处理
    void isPageBusy(guest).then(function (busy) {
      if (busy) return
      sendShortcut(host, "escape")
    })
  })
}
/** 监听内嵌页侧键 @param guest 内嵌页内容 */
function bindGuestSideButton(guest: WebContents): void {
  guest.on("dom-ready", function () {
    // 每次文档重建后都需重新挂载监听
    guest.executeJavaScript(SIDE_BUTTON_SCRIPT).catch(function (error) {
      console.warn("[guest] 侧键监听挂载失败：", error)
    })
  })
}
/** 配置内嵌页交互：外链转交系统浏览器 @param guest 内嵌页内容 @param host 宿主页面 */
function prepareGuest(guest: WebContents, host: WebContents): void {
  if (!isGuestReady) {
    prepareGuestSession(guest.session)
    isGuestReady = true
  }
  bindGuestShortcut(guest, host)
  bindGuestSideButton(guest)
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
      prepareGuest(guest, mainWindow.webContents)
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

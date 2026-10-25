// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { BrowserWindow } from "electron"
import path from "path"
import icon from "../../resources/icon_mini.png?asset"
import { doEnv } from "./env"
import { doSecurity } from "./security"
import { doStore } from "./service/store"
/** 解析数值（兼容历史配置里的字符串存储） @param value 原始值 @return 数值，无法解析时为 undefined */
function parseNumber(value: unknown): number | undefined {
  if (typeof value == "number") return isNaN(value) ? undefined : value
  if (typeof value != "string" || value.trim() == "") return undefined
  const result = Number(value)
  return isNaN(result) ? undefined : result
}
/** 解析尺寸 @param value 原始值 @param fallback 兜底值 @return 尺寸 */
function parseSize(value: unknown, fallback: number): number {
  const size = parseNumber(value)
  return size != undefined && size > 0 ? size : fallback
}
/** 保持焦点 @param mainWindow 主窗口 @param config 窗口配置 */
function keepFocus(mainWindow: BrowserWindow, config: Record<string, any>): void {
  // 仅在开启强制置顶时生效
  if (typeof config.isFocus != "boolean" || !config.isFocus) return
  /** 还原计时器 */
  let timer: NodeJS.Timeout | undefined
  setInterval(() => {
    // 窗口已全部关闭时不再抢焦点
    if (BrowserWindow.getAllWindows().length <= 0) return
    if (mainWindow.isFocused()) return
    // 抢占焦点后立即最小化，再还原以把窗口顶到最前
    mainWindow.focus()
    mainWindow.minimize()
    if (timer != undefined) clearTimeout(timer)
    timer = setTimeout(() => {
      mainWindow.restore()
    }, 50)
  }, 300)
}
/** 保存窗口尺寸与位置 @param mainWindow 主窗口 */
function saveBounds(mainWindow: BrowserWindow): void {
  // 取常规状态下的边界，最大化或全屏时仍能恢复到原尺寸
  const { width, height, x, y } = mainWindow.getNormalBounds()
  const panel: Record<string, any> = doStore.get("panel") ?? {}
  // 只覆盖尺寸与位置，保留面板其余配置
  doStore.set({ panel: { ...panel, window: { ...(panel.window ?? {}), width, height, x, y } } })
}
/** 窗口模块 */
export const doWindow: {
  /** 主窗口 */
  main?: BrowserWindow
  /** 创建窗口 @return 主窗口 */
  create: () => BrowserWindow
} = {
  create: function (): BrowserWindow {
    // 疏理窗口配置
    const config: Record<string, any> = doStore.get("panel.window") ?? {}
    // 创建窗口
    const mainWindow = new BrowserWindow({
      // 窗口宽度
      width: parseSize(config.width, 1280),
      // 窗口高度
      height: parseSize(config.height, 720),
      // 窗口左边距，缺省时由系统居中
      x: parseNumber(config.x),
      // 窗口上边距，缺省时由系统居中
      y: parseNumber(config.y),
      // 窗口置顶
      alwaysOnTop: typeof config.isTop == "boolean" ? config.isTop : false,
      // 窗口全屏
      fullscreen: typeof config.fullscreen == "boolean" ? config.fullscreen : false,
      // 无边框
      frame: typeof config.frame == "boolean" ? !config.frame : true,
      // 窗口是否在创建时显示
      show: false,
      // 自动隐藏菜单栏
      autoHideMenuBar: true,
      // 窗口图标
      icon,
      // 网页偏好
      webPreferences: {
        // 预加载脚本
        preload: path.join(__dirname, "../preload/index.js"),
        // 页面不得直接使用 Node 能力，原生能力只能经预加载白名单桥接
        nodeIntegration: false,
        // 上下文隔离，预加载与页面分处两个 JS 世界
        contextIsolation: true,
        // 渲染进程沙箱，预加载仅保留 contextBridge 与受限 ipcRenderer
        sandbox: true,
        // 内嵌页依赖 WebView 容器
        webviewTag: true
      }
    })
    mainWindow.on("ready-to-show", () => {
      // 显示窗口
      mainWindow.show()
      keepFocus(mainWindow, config)
    })
    // 应用安全策略
    doSecurity.apply(mainWindow)
    // 关闭前记录尺寸与位置，供下次启动恢复
    mainWindow.on("close", () => saveBounds(mainWindow))
    // 加载页面
    if (doEnv.devUrl != "") {
      mainWindow.loadURL(doEnv.devUrl)
    } else {
      mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"))
    }
    doWindow.main = mainWindow
    return mainWindow
  }
}

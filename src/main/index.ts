// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { app, shell, BrowserWindow } from "electron"
import { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import icon from "../../resources/icon_mini.png?asset"
import { doBase, doEvent } from "./base"
/**
 * 校验数字
 */
export function isNumeric(data: any): boolean {
  // 初始化变量
  switch (typeof data) {
    case "string":
    // 字符串
    // falls through
    case "number":
      // 数值
      data = data.toString()
      return parseFloat(data) == data && !isNaN(data)
  }
  return false
}
// 获取配置
const config: { window: any } = {
  window: doBase.store.get("panel.window")
}
// 创建窗口
function createWindow(): BrowserWindow {
  // 疏理配置
  config.window?.width != undefined && (config.window.width -= 0)
  config.window?.height != undefined && (config.window.height -= 0)
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // 窗口宽度
    width: config.window?.width > 0 ? config.window.width - 0 : 1280,
    // 窗口高度
    height: config.window?.height > 0 ? config.window.height - 0 : 720,
    // 窗口左边距
    x: isNumeric(config.window?.x) ? config.window.x - 0 : undefined,
    // 窗口上边距
    y: isNumeric(config.window?.y) ? config.window.y - 0 : undefined,
    // 窗口置顶
    alwaysOnTop:
      typeof config.window?.isTop == "boolean" ? config.window.isTop : false,
    // 窗口全屏
    fullscreen:
      typeof config.window?.fullscreen == "boolean"
        ? config.window.fullscreen
        : false,
    // 窗口边框
    frame:
      typeof config.window?.frame == "boolean" ? !config.window.frame : true,
    // 窗口是否在创建时显示
    show: false,
    // 自动隐藏菜单栏
    autoHideMenuBar: true,
    // 窗口图标
    icon,
    // 网页偏好
    webPreferences: {
      // 预加载脚本
      preload: join(__dirname, "../preload/index.js"),
      // 沙箱模式
      sandbox: false,
      // WebView标签
      webviewTag: true
    }
  })
  mainWindow.setBounds({
    // 窗口宽度
    width: config.window?.width > 0 ? config.window.width - 0 : 1280,
    // 窗口高度
    height: config.window?.height > 0 ? config.window.height - 0 : 720
  })
  mainWindow.on("ready-to-show", () => {
    // 显示窗口
    mainWindow.show()
    // 检测强制置顶
    if (typeof config.window?.isFocus == "boolean" && config.window.isFocus) {
      // 创建计时器
      let timer: any
      // 焦点检测
      setInterval(() => {
        const count = BrowserWindow.getAllWindows().length
        if (!(count > 0)) return
        if (mainWindow.isFocused()) {
          return
        }
        // 获得焦点
        mainWindow.focus()
        mainWindow.minimize()
        clearTimeout(timer)
        timer = setTimeout(() => {
          mainWindow.restore()
        }, 50)
      }, 300)
    }
  })
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: "deny" }
  })
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"])
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"))
  }
  return mainWindow
}
//禁用http缓存
if (
  typeof config.window?.http_cache == "boolean" &&
  !config.window.http_cache
) {
  app.commandLine.appendSwitch("--disable-http-cache")
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("net.fxri")
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  // 创建窗口
  const mainWindow = createWindow()
  // 注册事件
  doBase.register(mainWindow)
  // 创建HTTP服务
  doEvent.httpServer()
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

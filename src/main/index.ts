// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { app, BrowserWindow } from "electron"
import { electronApp, optimizer } from "@electron-toolkit/utils"
import { doConfig } from "@shared/config"
import { doEnv } from "./env"
import { doIpc } from "./ipc"
import { doStatic } from "./service/static"
import { doStore } from "./service/store"
import { doWindow } from "./window"
// 禁用 HTTP 缓存
doEnv.applySwitch((doStore.get("panel.window") ?? {}).http_cache)
// 单实例锁：重复启动时聚焦已有窗口，不再新开
const locked = app.requestSingleInstanceLock()
if (!locked) {
  app.quit()
} else {
  app.on("second-instance", () => {
    if (doWindow.main == undefined) return
    if (doWindow.main.isMinimized()) doWindow.main.restore()
    doWindow.main.show()
    doWindow.main.focus()
  })
  // 应用初始化
  app.whenReady().then(() => {
    // 设置应用用户模型标识
    electronApp.setAppUserModelId("net.fxri")
    // 开发环境按 F12 开关调试工具，生产环境忽略刷新快捷键
    app.on("browser-window-created", (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
    // 创建窗口并注册事件
    doWindow.create()
    doIpc.register()
    // 创建HTTP服务：开关开启时才启动，失败不阻断应用
    if (doConfig.migrate(doStore.all()).panel.server.switch) {
      doStatic.start().catch(error => console.warn("[static] 静态服务启动失败：", error))
    }
    app.on("activate", function () {
      // macOS 上点击 dock 图标且无窗口时重建窗口
      if (BrowserWindow.getAllWindows().length === 0) doWindow.create()
    })
  })
  // 除 macOS 外关闭全部窗口即退出
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit()
    }
  })
}

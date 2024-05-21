// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { app, BrowserWindow, ipcMain, dialog } from "electron"
import Store from "electron-store"
import httpServer from "http-server"
import shell from "child_process"
import path from "path"
import fs from "fs"
/** 根路径 */
const doRoot = app.isPackaged ? path.resolve(app.getPath("exe"), "..") : path.resolve(app.getAppPath())
/** 基础模块 */
export const doBase: {
  /** 应用数据 */
  app: {
    /** 主窗口 */
    mainWindow?: BrowserWindow
  }
  /** 根路径 */
  root: string
  /** 存储数据 */
  store: Store
  /** 注册事件 */
  register: any
} = {
  app: {},
  root: doRoot,
  store: new Store({
    cwd: path.resolve(doRoot, app.isPackaged ? "../fxwl-local/config" : "config")
  }),
  register: function (mainWindow: BrowserWindow): void {
    // 记录主窗口
    doBase.app.mainWindow = mainWindow
    // 配置事件
    for (const key in doEvent) {
      ipcMain.handle(key, doEvent[key])
    }
  }
}
/** 事件模块 */
export const doEvent = {
  /** 重启应用 */
  restart: function (): void {
    app.relaunch()
    app.quit()
  },
  /** 退出应用 */
  quit: function (): void {
    app.quit()
  },
  /** 命令脚本 */
  shell: function (command: string): void {
    shell.exec(command)
  },
  /** 数据存储 */
  store: function (_event: any, name: "set" | "get", data: any): any {
    switch (name) {
      case "set":
        // 设置数据
        doBase.store.set(data)
        // 判断开机自启
        if (typeof data?.panel?.window?.startup == "boolean") {
          // 设置开机自起
          const exeName = path.basename(process.execPath)
          app.setLoginItemSettings({
            // 设置为true注册开机自起
            openAtLogin: data.panel.window.startup,
            // macOs
            openAsHidden: false,
            path: process.execPath,
            args: ["--processStart", `"${exeName}"`]
          })
        }
        break
      case "get":
        // 获取数据
        return doBase.store.get(data)
    }
  },
  /** 打开文件 */
  openFile: async function (_event: any, option: object): Promise<any> {
    // 校验窗口
    if (doBase.app.mainWindow == undefined) return
    // 打开文件
    const { canceled, filePaths } = await dialog.showOpenDialog(doBase.app.mainWindow, option)
    // 返回数据
    if (!canceled) {
      return filePaths
    }
  },
  /** 创建HTTP服务 */
  httpServer: function (): void {
    // 获取配置
    const config: { app: any; server: any } = {
      app: doBase.store.get("app"),
      server: doBase.store.get("panel.server")
    }
    // 校验开关
    if (!config.server?.switch) return
    // 疏理配置
    config.server?.port != undefined && (config.server.port -= 0)
    typeof config.server?.port != "number" && (config.server.port = 2602)
    config.server?.dir == undefined && (config.server.dir = "website")
    // 疏理目录
    if (app.isPackaged) {
      config.server.dir = path.resolve(doBase.root, "../fxwl-local/", config.server.dir)
    } else {
      config.server.dir = path.resolve(doBase.root, config.server.dir)
    }
    // 创建目录
    if (!fs.existsSync(config.server.dir)) {
      fs.mkdirSync(config.server.dir)
    }
    // 检测端口占用
    shell.exec('netstat -ano | findstr /R "' + config.server.port + '.*LISTENING"', (_err, stdout) => {
      // 校验输出
      if (stdout != "") {
        config.server?.port_prompt &&
          doBase.app.mainWindow &&
          dialog.showMessageBox(doBase.app.mainWindow, {
            message: "端口：" + config.server.port + "已被占用",
            title: config.app?.title ?? "方弦物联"
          })
        return false
      }
      // 创建HTTP服务
      httpServer
        .createServer({
          root: config.server.dir,
          showDir: false
        })
        .listen(config.server.port)
      return true
    })
  }
}

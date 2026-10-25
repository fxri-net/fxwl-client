// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { dialog } from "electron"
import httpServer from "http-server"
import fs from "fs"
import path from "path"
import { doEnv } from "../env"
import { doWindow } from "../window"
import { doPort } from "./port"
import { doStore } from "./store"
/** 静态服务 */
export const doStatic = {
  /** 启动服务 */
  start: async function (): Promise<void> {
    // 读取服务配置
    const appConfig: Record<string, any> = doStore.get("app") ?? {}
    const serverConfig: Record<string, any> = doStore.get("panel.server") ?? {}
    // 未开启服务时直接返回
    if (!serverConfig.switch) return
    // 端口与目录兜底
    const port = Number(serverConfig.port) > 0 ? Number(serverConfig.port) : 2602
    const dir = path.resolve(doEnv.localDir, serverConfig.dir ?? "website")
    // 目录不存在时按层级创建
    fs.mkdirSync(dir, { recursive: true })
    // 端口被占用时按配置提示
    if (await doPort.check(port)) {
      if (serverConfig.port_prompt && doWindow.main != undefined) {
        dialog.showMessageBox(doWindow.main, {
          message: "端口：" + port + "已被占用",
          title: appConfig.title ?? "方弦物联"
        })
      }
      return
    }
    // 创建静态服务
    httpServer
      .createServer({
        root: dir,
        showDir: false
      })
      .listen(port)
  }
}

// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { dialog } from "electron"
import httpServer from "http-server"
import fs from "fs"
import path from "path"
import type { Server } from "http"
import type { Socket } from "net"
import { doConfig } from "@shared/config"
import { ServiceState } from "@shared/defines"
import type { ServiceStatus } from "@shared/contract"
import { doEnv } from "../env"
import { doWindow } from "../window"
import { doPort } from "./port"
import { doStore } from "./store"
/** http-server 的包装实例：真实 HTTP 服务挂在 server 属性上 */
interface HttpServerWrap {
  /** 底层 HTTP 服务 */
  server: Server
}
/** 运行中的服务实例 */
let server: Server | undefined
/** 存活连接：Node 16 无 closeAllConnections，需自行记录以便停止时断开 */
const sockets: Socket[] = []
/** 服务状态 */
let status: ServiceStatus = { state: ServiceState.Stopped, dir: "", port: 0 }
/** 创建并监听服务 @param dir 站点目录 @param port 端口 @return 服务实例 */
function doListen(dir: string, port: number): Promise<Server> {
  return new Promise(function (resolve, reject) {
    // http-server 返回的是包装对象，事件与监听需落在 server 属性上的真实服务
    const wrap = httpServer.createServer({ root: dir, showDir: false }) as unknown as HttpServerWrap
    /** 真实 HTTP 服务 */
    const instance = wrap.server
    instance.once("error", reject)
    instance.on("connection", function (socket) {
      sockets.push(socket)
      // 连接断开后移出清单，避免停止时重复销毁
      socket.once("close", function () {
        /** 连接在清单中的位置 */
        const index = sockets.indexOf(socket)
        if (index >= 0) sockets.splice(index, 1)
      })
    })
    instance.listen(port, () => resolve(instance))
  })
}
/** 静态服务 */
export const doStatic = {
  /** 启动服务 @return 启动后的状态 */
  start: async function (): Promise<ServiceStatus> {
    // 已运行时直接返回当前状态，重复调用保持幂等
    if (status.state == ServiceState.Running) return doStatic.status()
    /** 完整配置 */
    const config = doConfig.migrate(doStore.all())
    /** 服务器配置 */
    const option = config.panel.server
    /** 站点目录：相对路径按本地数据目录解析 */
    const dir = path.resolve(doEnv.localDir, option.dir)
    fs.mkdirSync(dir, { recursive: true })
    /** 实际端口：默认端口被占用时向后避让 */
    const port = await doPort.pick(option.port)
    if (port <= 0) throw new Error("从端口 " + option.port + " 起未找到可用端口")
    // 端口发生避让时按配置提示，实际端口始终通过状态回传给渲染层
    if (port != option.port && option.port_prompt && doWindow.main != undefined) {
      dialog.showMessageBox(doWindow.main, {
        type: "warning",
        title: config.app.title,
        message: "端口：" + option.port + " 已被占用，已改用 " + port
      })
    }
    try {
      server = await doListen(dir, port)
    } catch (error) {
      // 监听失败时不保留半启动状态
      server = undefined
      sockets.length = 0
      throw error
    }
    status = { state: ServiceState.Running, dir: dir, port: port }
    return doStatic.status()
  },
  /** 停止服务 @return 停止后的状态 */
  stop: function (): Promise<ServiceStatus> {
    /** 待关闭的实例 */
    const instance = server
    // 未运行时直接返回，重复调用保持幂等
    if (instance == undefined) return Promise.resolve(doStatic.status())
    server = undefined
    return new Promise(function (resolve) {
      // 先断开存活连接，否则长连接会让 close 一直等待
      sockets.splice(0).forEach(socket => socket.destroy())
      instance.close(function () {
        status = { state: ServiceState.Stopped, dir: status.dir, port: status.port }
        resolve(doStatic.status())
      })
    })
  },
  /** 查询状态 @return 当前状态 */
  status: function (): ServiceStatus {
    // 返回副本，避免调用方改到内部状态
    return { ...status }
  }
}

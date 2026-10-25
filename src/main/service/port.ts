// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import net from "net"
/** 尝试绑定端口 @param port 端口 @param host 绑定地址 @return 是否绑定成功 */
function doBind(port: number, host: string): Promise<boolean> {
  return new Promise(function (resolve) {
    /** 探测用临时服务 */
    const server = net.createServer()
    // 端口已被同地址监听时绑定报错，否则绑定成功后再释放
    server.once("error", () => resolve(false))
    server.once("listening", () => server.close(() => resolve(true)))
    server.listen(port, host)
  })
}
/** 端口服务 */
export const doPort = {
  /** 检测端口是否可用 @param port 端口 @return 是否可用 */
  available: async function (port: number): Promise<boolean> {
    // Windows 允许通配地址与具体地址同时占用同一端口，需分别探测：通配地址挡住全域占用，回环地址挡住仅监听 127.0.0.1 的进程
    if (!(await doBind(port, "0.0.0.0"))) return false
    return doBind(port, "127.0.0.1")
  },
  /** 从起始端口向后寻找可用端口 @param start 起始端口 @param count 最多尝试次数 @return 可用端口，未找到时为 0 */
  pick: async function (start: number, count = 100): Promise<number> {
    for (let index = 0; index < count; index++) {
      /** 本次候选端口 */
      const port = start + index
      if (port > 65535) break
      if (await doPort.available(port)) return port
    }
    return 0
  }
}

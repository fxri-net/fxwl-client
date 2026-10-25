// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { IPC_CHANNEL } from "@shared/contract"
import { doPort } from "../service/port"
import { doStatic } from "../service/static"
import { doHandle } from "./register"
/** 服务域事件 */
export const doIpcService = {
  /** 注册事件 */
  register: function (): void {
    // 启动静态服务
    doHandle(IPC_CHANNEL.ServiceStart, () => doStatic.start())
    // 停止静态服务
    doHandle(IPC_CHANNEL.ServiceStop, () => doStatic.stop())
    // 查询静态服务状态
    doHandle(IPC_CHANNEL.ServiceStatus, () => doStatic.status())
    // 探测端口是否可用
    doHandle(IPC_CHANNEL.ServicePort, param => doPort.available(param.port))
  }
}

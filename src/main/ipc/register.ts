// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { ipcMain } from "electron"
import { IPC_VALIDATORS } from "@shared/contract"
import type { IpcChannel, IpcParam, IpcResult } from "@shared/contract"
/** 注册通道：入参校验与错误包装统一在此完成 @param channel 通道名 @param handler 业务处理函数 */
export function doHandle<K extends IpcChannel>(channel: K, handler: (param: IpcParam<K>) => IpcResult<K> | Promise<IpcResult<K>>): void {
  ipcMain.handle(channel, async function (_event, param: unknown): Promise<IpcResult<K>> {
    /** 入参校验结果 */
    const message = IPC_VALIDATORS[channel](param)
    // 入参不合法时直接拒绝，不进入业务处理
    if (message != null) throw new Error("[" + channel + "] 入参不合法：" + message)
    try {
      return await handler(param as IpcParam<K>)
    } catch (error) {
      // 统一补上通道前缀，渲染层可据此定位失败来源
      console.error("[" + channel + "] 处理失败：", error)
      throw new Error("[" + channel + "] " + (error instanceof Error ? error.message : String(error)))
    }
  })
}

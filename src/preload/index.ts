// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { contextBridge, ipcRenderer } from "electron"
import type { NativeBridge } from "@shared/contract"
/** 本地桥实例：只暴露白名单方法，页面拿不到 ipcRenderer 本身 */
const bridge: NativeBridge = {
  /** 重启应用 */
  restart: (): Promise<void> => ipcRenderer.invoke("restart"),
  /** 退出应用 */
  quit: (): Promise<void> => ipcRenderer.invoke("quit"),
  /** 配置读写 */
  store: (name, data): Promise<unknown> => ipcRenderer.invoke("store", name, data),
  /** 选择文件或目录 */
  openFile: (option): Promise<string[] | undefined> => ipcRenderer.invoke("openFile", option)
}
contextBridge.exposeInMainWorld("doNative", bridge)

// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { contextBridge, ipcRenderer } from "electron"
import type { IpcRendererEvent } from "electron"
import { IPC_CHANNEL, IPC_EVENT } from "@shared/contract"
import type { ClientShortcut, NativeBridge, ServiceStatus } from "@shared/contract"
/** 本地桥实例：只暴露白名单方法，页面拿不到 ipcRenderer 本身 */
const bridge: NativeBridge = {
  /** 应用能力 */
  app: {
    /** 应用版本 */
    version: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNEL.AppVersion),
    /** 重启应用 */
    restart: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNEL.AppRestart),
    /** 退出应用 */
    quit: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNEL.AppQuit),
    /** 打开配置目录 */
    openConfigDir: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNEL.AppOpenConfigDir)
  },
  /** 配置能力 */
  config: {
    /** 读取配置 */
    get: (scope): Promise<Record<string, unknown>> => ipcRenderer.invoke(IPC_CHANNEL.ConfigGet, { scope }),
    /** 写入配置 */
    set: (scope, data): Promise<void> => ipcRenderer.invoke(IPC_CHANNEL.ConfigSet, { scope, data }),
    /** 重置配置 */
    reset: (scope): Promise<void> => ipcRenderer.invoke(IPC_CHANNEL.ConfigReset, { scope }),
    /** 配置目录 */
    dir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNEL.ConfigDir)
  },
  /** 服务能力 */
  service: {
    /** 启动静态服务 */
    start: (): Promise<ServiceStatus> => ipcRenderer.invoke(IPC_CHANNEL.ServiceStart),
    /** 停止静态服务 */
    stop: (): Promise<ServiceStatus> => ipcRenderer.invoke(IPC_CHANNEL.ServiceStop),
    /** 查询静态服务状态 */
    status: (): Promise<ServiceStatus> => ipcRenderer.invoke(IPC_CHANNEL.ServiceStatus),
    /** 探测端口是否可用 */
    port: (port): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNEL.ServicePort, { port })
  },
  /** 对话框能力 */
  dialog: {
    /** 选择目录 */
    openDirectory: (title): Promise<string | null> => ipcRenderer.invoke(IPC_CHANNEL.DialogOpenDirectory, { title })
  },
  /** 客户端能力 */
  client: {
    /** 订阅内嵌页快捷键 */
    onShortcut: (handler): (() => void) => {
      /** 通道监听器 */
      const listener = function (_event: IpcRendererEvent, shortcut: ClientShortcut): void {
        handler(shortcut)
      }
      ipcRenderer.on(IPC_EVENT.ClientShortcut, listener)
      return function () {
        ipcRenderer.removeListener(IPC_EVENT.ClientShortcut, listener)
      }
    }
  }
}
contextBridge.exposeInMainWorld("doNative", bridge)

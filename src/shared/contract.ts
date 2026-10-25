// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { STORE_SCOPES } from "./defines"
import type { ServiceState, StoreScope } from "./defines"

/** 静态服务状态 */
export interface ServiceStatus {
  /** 运行状态 */
  state: ServiceState
  /** 站点目录 */
  dir: string
  /** 实际端口 */
  port: number
}

/** 契约定义：每个通道声明入参与出参 */
export interface IpcContract {
  /** 应用版本 */
  "app:version": { param: void; result: string }
  /** 重启应用 */
  "app:restart": { param: void; result: void }
  /** 退出应用 */
  "app:quit": { param: void; result: void }
  /** 打开配置目录 */
  "app:openConfigDir": { param: void; result: void }
  /** 读取配置 */
  "config:get": { param: { scope: StoreScope }; result: Record<string, unknown> }
  /** 写入配置 */
  "config:set": { param: { scope: StoreScope; data: Record<string, unknown> }; result: void }
  /** 重置配置 */
  "config:reset": { param: { scope: StoreScope }; result: void }
  /** 配置目录 */
  "config:dir": { param: void; result: string }
  /** 启动静态服务 */
  "service:start": { param: void; result: ServiceStatus }
  /** 停止静态服务 */
  "service:stop": { param: void; result: ServiceStatus }
  /** 查询静态服务状态 */
  "service:status": { param: void; result: ServiceStatus }
  /** 探测端口是否可用 */
  "service:port": { param: { port: number }; result: boolean }
  /** 选择目录 */
  "dialog:openDirectory": { param: { title?: string }; result: string | null }
}

/** 通道名 */
export type IpcChannel = keyof IpcContract
/** 通道入参 */
export type IpcParam<K extends IpcChannel> = IpcContract[K]["param"]
/** 通道出参 */
export type IpcResult<K extends IpcChannel> = IpcContract[K]["result"]

/** 内嵌页快捷键 */
export type ClientShortcut = "escape" | "back"

/** 事件契约：主进程单向推送，渲染层按需订阅 */
export interface EventContract {
  /** 内嵌页快捷键 */
  "client:shortcut": ClientShortcut
}

/** 事件名 */
export type EventChannel = keyof EventContract
/** 事件负载 */
export type EventPayload<K extends EventChannel> = EventContract[K]

/** 本地桥：渲染层可用的原生能力，白名单之外不可达 */
export interface NativeBridge {
  /** 应用能力 */
  app: {
    /** 应用版本 @return 版本号 */
    version: () => Promise<IpcResult<"app:version">>
    /** 重启应用 */
    restart: () => Promise<IpcResult<"app:restart">>
    /** 退出应用 */
    quit: () => Promise<IpcResult<"app:quit">>
    /** 打开配置目录 */
    openConfigDir: () => Promise<IpcResult<"app:openConfigDir">>
  }
  /** 配置能力 */
  config: {
    /** 读取配置 @param scope 存储范围 @return 该范围的归一配置 */
    get: (scope: StoreScope) => Promise<IpcResult<"config:get">>
    /** 写入配置 @param scope 存储范围 @param data 该范围的完整配置 */
    set: (scope: StoreScope, data: Record<string, unknown>) => Promise<IpcResult<"config:set">>
    /** 重置配置 @param scope 存储范围 */
    reset: (scope: StoreScope) => Promise<IpcResult<"config:reset">>
    /** 配置目录 @return 配置目录路径 */
    dir: () => Promise<IpcResult<"config:dir">>
  }
  /** 服务能力 */
  service: {
    /** 启动静态服务 @return 启动后的状态 */
    start: () => Promise<IpcResult<"service:start">>
    /** 停止静态服务 @return 停止后的状态 */
    stop: () => Promise<IpcResult<"service:stop">>
    /** 查询静态服务状态 @return 当前状态 */
    status: () => Promise<IpcResult<"service:status">>
    /** 探测端口是否可用 @param port 端口 @return 是否可用 */
    port: (port: number) => Promise<IpcResult<"service:port">>
  }
  /** 对话框能力 */
  dialog: {
    /** 选择目录 @param title 对话框标题 @return 选中的目录，取消时为 null */
    openDirectory: (title?: string) => Promise<IpcResult<"dialog:openDirectory">>
  }
  /** 客户端能力 */
  client: {
    /** 订阅内嵌页快捷键 @param handler 快捷键处理函数 @return 取消订阅 */
    onShortcut: (handler: (shortcut: ClientShortcut) => void) => () => void
  }
}

/** 通道常量 */
export const IPC_CHANNEL = {
  /** 应用版本 */
  AppVersion: "app:version",
  /** 重启应用 */
  AppRestart: "app:restart",
  /** 退出应用 */
  AppQuit: "app:quit",
  /** 打开配置目录 */
  AppOpenConfigDir: "app:openConfigDir",
  /** 读取配置 */
  ConfigGet: "config:get",
  /** 写入配置 */
  ConfigSet: "config:set",
  /** 重置配置 */
  ConfigReset: "config:reset",
  /** 配置目录 */
  ConfigDir: "config:dir",
  /** 启动静态服务 */
  ServiceStart: "service:start",
  /** 停止静态服务 */
  ServiceStop: "service:stop",
  /** 查询静态服务状态 */
  ServiceStatus: "service:status",
  /** 探测端口是否可用 */
  ServicePort: "service:port",
  /** 选择目录 */
  DialogOpenDirectory: "dialog:openDirectory"
} as const

/** 事件常量 */
export const IPC_EVENT = {
  /** 内嵌页快捷键 */
  ClientShortcut: "client:shortcut"
} as const

/** 是否普通对象 @param value 原始值 @return 是否普通对象 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** 校验空入参 @param param 入参 @return 错误信息 */
const validateEmpty = (param: unknown): string | null => (param === undefined || param === null ? null : "该通道不接受入参")

/** 校验选择目录入参 @param param 入参 @return 错误信息 */
const validateOpenDirectory = (param: unknown): string | null => {
  if (param === undefined || param === null) return null
  if (!isPlainObject(param)) return "入参必须是对象"
  const title = param.title
  if (title !== undefined && (typeof title !== "string" || title.length > 60)) return "标题必须是不超过 60 字的字符串"
  return null
}

/** 校验端口入参 @param param 入参 @return 错误信息 */
const validatePort = (param: unknown): string | null => {
  if (!isPlainObject(param)) return "入参必须是对象"
  const port = param.port
  if (typeof port !== "number" || !Number.isInteger(port) || port < 1 || port > 65535) return "端口必须是 1 到 65535 之间的整数"
  return null
}

/** 校验存储范围入参 @param param 入参 @return 错误信息 */
const validateScope = (param: unknown): string | null => {
  if (!isPlainObject(param)) return "入参必须是对象"
  if (STORE_SCOPES.indexOf(param.scope as StoreScope) < 0) return "存储范围必须是 app、client 或 panel"
  return null
}

/** 校验配置写入入参 @param param 入参 @return 错误信息 */
const validateSetData = (param: unknown): string | null => {
  const message = validateScope(param)
  if (message) return message
  if (!isPlainObject((param as { data?: unknown }).data)) return "配置数据必须是对象"
  return null
}

/** 入参校验表：校验通过返回 null，不通过返回错误信息 */
export const IPC_VALIDATORS: { [K in IpcChannel]: (param: unknown) => string | null } = {
  "app:version": validateEmpty,
  "app:restart": validateEmpty,
  "app:quit": validateEmpty,
  "app:openConfigDir": validateEmpty,
  "config:get": validateScope,
  "config:set": validateSetData,
  "config:reset": validateScope,
  "config:dir": validateEmpty,
  "service:start": validateEmpty,
  "service:stop": validateEmpty,
  "service:status": validateEmpty,
  "service:port": validatePort,
  "dialog:openDirectory": validateOpenDirectory
}

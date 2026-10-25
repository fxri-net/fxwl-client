// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
/** 导航锚点 */
export const NavAnchor = {
  /** 左上 */
  TopLeft: "top-left",
  /** 右上 */
  TopRight: "top-right",
  /** 右下 */
  BottomRight: "bottom-right",
  /** 左下 */
  BottomLeft: "bottom-left"
} as const
/** 导航锚点 */
export type NavAnchor = (typeof NavAnchor)[keyof typeof NavAnchor]
/** 导航锚点清单 */
export const NAV_ANCHORS: NavAnchor[] = [NavAnchor.TopLeft, NavAnchor.TopRight, NavAnchor.BottomRight, NavAnchor.BottomLeft]

/** 存储范围 */
export const StoreScope = {
  /** 应用级 */
  App: "app",
  /** 客户端级 */
  Client: "client",
  /** 面板级 */
  Panel: "panel"
} as const
/** 存储范围 */
export type StoreScope = (typeof StoreScope)[keyof typeof StoreScope]
/** 存储范围清单 */
export const STORE_SCOPES: StoreScope[] = [StoreScope.App, StoreScope.Client, StoreScope.Panel]

/** 服务状态 */
export const ServiceState = {
  /** 已停止 */
  Stopped: "stopped",
  /** 运行中 */
  Running: "running"
} as const
/** 服务状态 */
export type ServiceState = (typeof ServiceState)[keyof typeof ServiceState]

/** 内嵌页会话分区：不带 persist 前缀，数据只留在内存，与应用自身会话隔离 */
export const CLIENT_PARTITION = "fx-client"

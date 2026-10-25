// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { NAV_ANCHORS, STORE_SCOPES } from "./defines"
import type { NavAnchor, StoreScope } from "./defines"

/** 导航配置 */
export interface NavConfig {
  /** 停靠锚点 */
  anchor: NavAnchor
  /** 水平偏移（像素） */
  offsetX: number
  /** 垂直偏移（像素） */
  offsetY: number
  /** 闲置不透明度 */
  idleOpacity: number
}

/** 应用配置 */
export interface AppSection {
  /** 标题 */
  title: string
  /** 调试模式 */
  debug: boolean
  /** 存储名称 */
  store_name: StoreScope
  /** 默认页面 */
  url_default: string
  /** 页面列表 */
  url_list: Record<string, string>
  /** 面板索引 */
  panel_index: string
}

/** 窗口配置 */
export interface WindowSection {
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
  /** 左边距 */
  x: number | "center"
  /** 上边距 */
  y: number | "center"
  /** 全屏 */
  fullscreen: boolean
  /** 无边框 */
  frame: boolean
  /** 置顶 */
  isTop: boolean
  /** 强制置顶 */
  isFocus: boolean
  /** 开机自启 */
  startup: boolean
  /** HTTP缓存 */
  http_cache: boolean
}

/** 服务器配置 */
export interface ServerSection {
  /** 开关 */
  switch: boolean
  /** 目录 */
  dir: string
  /** 端口 */
  port: number
  /** 端口占用提示 */
  port_prompt: boolean
}

/** 面板配置 */
export interface PanelSection {
  /** 窗口 */
  window: WindowSection
  /** 服务器 */
  server: ServerSection
}

/** 客户端配置 */
export interface ClientSection {
  /** 页面地址 */
  url_host: string
  /** 导航 */
  nav: NavConfig
}

/** 完整配置 */
export interface AppConfig {
  /** 配置版本 */
  version: number
  /** 应用配置 */
  app: AppSection
  /** 面板配置 */
  panel: PanelSection
  /** 客户端配置 */
  client: ClientSection
}

/** 配置版本 */
export const CONFIG_VERSION = 1

/** 导航默认配置 */
export const NAV_DEFAULTS: NavConfig = {
  /** 停靠锚点 */
  anchor: "top-left",
  /** 水平偏移（像素） */
  offsetX: 0,
  /** 垂直偏移（像素） */
  offsetY: 0,
  /** 闲置不透明度 */
  idleOpacity: 0.35
}

/** 默认配置 */
export const CONFIG_DEFAULTS: AppConfig = {
  /** 配置版本 */
  version: CONFIG_VERSION,
  /** 应用配置 */
  app: {
    /** 标题 */
    title: "方弦物联",
    /** 调试模式 */
    debug: false,
    /** 存储名称 */
    store_name: "app",
    /** 默认页面 */
    url_default: "/",
    /** 页面列表 */
    url_list: {
      首页: "/",
      配置项: "/config",
      客户端: "/client/index"
    },
    /** 面板索引 */
    panel_index: "0"
  },
  /** 面板配置 */
  panel: {
    /** 窗口 */
    window: {
      /** 宽度 */
      width: 1280,
      /** 高度 */
      height: 720,
      /** 左边距 */
      x: "center",
      /** 上边距 */
      y: "center",
      /** 全屏 */
      fullscreen: false,
      /** 无边框 */
      frame: false,
      /** 置顶 */
      isTop: false,
      /** 强制置顶 */
      isFocus: false,
      /** 开机自启 */
      startup: false,
      /** HTTP缓存 */
      http_cache: true
    },
    /** 服务器 */
    server: {
      /** 开关 */
      switch: false,
      /** 目录 */
      dir: "website",
      /** 端口 */
      port: 2602,
      /** 端口占用提示 */
      port_prompt: false
    }
  },
  /** 客户端配置 */
  client: {
    /** 页面地址 */
    url_host: "http://127.0.0.1:2602",
    /** 导航 */
    nav: NAV_DEFAULTS
  }
}

/** 配置迁移表：键为起始版本，值为升级到下一版本的迁移函数 */
const CONFIG_MIGRATIONS: Record<number, (raw: Record<string, unknown>) => Record<string, unknown>> = {
  // 0 → 1：旧版四角样式字符串收敛为导航配置，废弃的选项表直接丢弃
  0: raw => {
    const app: Record<string, unknown> = isPlainObject(raw.app) ? { ...raw.app } : {}
    const client: Record<string, unknown> = isPlainObject(raw.client) ? { ...raw.client } : {}
    // 选项表由界面按锚点重新生成，不再持久化
    delete app.back_btns
    const legacyStyle = client.back_btn
    delete client.back_btn
    return {
      ...raw,
      app,
      client: {
        ...client,
        // 已有导航配置时保留原值，缺失时按旧样式字符串推导
        nav: isPlainObject(client.nav) ? client.nav : { ...NAV_DEFAULTS, anchor: parseLegacyAnchor(legacyStyle) }
      }
    }
  }
}

/** 迁移旧版配置到当前版本 @param raw 原始配置 @return 归一后的配置 */
const migrateConfig = (raw: unknown): AppConfig => {
  let data: Record<string, unknown> = isPlainObject(raw) ? { ...raw } : {}
  let version = readVersion(data.version)
  // 只做向前迁移，逐级升到当前版本
  while (version < CONFIG_VERSION) {
    const step = CONFIG_MIGRATIONS[version]
    if (!step) break
    data = step(data)
    version += 1
  }
  return normalizeConfig(data)
}

/** 归一应用配置 @param raw 原始配置 @return 应用配置 */
const normalizeApp = (raw: unknown): AppSection => {
  const defaults = CONFIG_DEFAULTS.app
  const data = isPlainObject(raw) ? raw : {}
  const urlList = normalizeUrlList(data.url_list)
  const urlDefault = pickString(data.url_default, defaults.url_default)
  // 默认页面存的是地址而非名称，须命中页面列表的值
  const urlValues = Object.keys(urlList).map(key => urlList[key])
  const fallback = urlValues.indexOf(defaults.url_default) >= 0 ? defaults.url_default : urlList[Object.keys(urlList)[0]]
  return {
    /** 标题 */
    title: pickString(data.title, defaults.title),
    /** 调试模式 */
    debug: pickBoolean(data.debug, defaults.debug),
    /** 存储名称 */
    store_name: pickEnum(data.store_name, STORE_SCOPES, defaults.store_name),
    /** 默认页面 */
    url_default: urlValues.indexOf(urlDefault) >= 0 ? urlDefault : fallback,
    /** 页面列表 */
    url_list: urlList,
    /** 面板索引 */
    panel_index: pickIndex(data.panel_index, defaults.panel_index)
  }
}

/** 归一客户端配置 @param raw 原始配置 @return 客户端配置 */
const normalizeClient = (raw: unknown): ClientSection => {
  const defaults = CONFIG_DEFAULTS.client
  const data = isPlainObject(raw) ? raw : {}
  return {
    /** 页面地址 */
    url_host: pickString(data.url_host, defaults.url_host),
    /** 导航 */
    nav: normalizeNav(data.nav)
  }
}

/** 归一完整配置 @param raw 原始配置 @return 完整配置 */
const normalizeConfig = (raw: unknown): AppConfig => {
  const data = isPlainObject(raw) ? raw : {}
  return {
    /** 配置版本 */
    version: CONFIG_VERSION,
    /** 应用配置 */
    app: normalizeApp(data.app),
    /** 面板配置 */
    panel: normalizePanel(data.panel),
    /** 客户端配置 */
    client: normalizeClient(data.client)
  }
}

/** 归一导航配置 @param raw 原始配置 @return 导航配置 */
const normalizeNav = (raw: unknown): NavConfig => {
  const data = isPlainObject(raw) ? raw : {}
  return {
    /** 停靠锚点 */
    anchor: pickEnum(data.anchor, NAV_ANCHORS, NAV_DEFAULTS.anchor),
    /** 水平偏移（像素） */
    offsetX: Math.round(pickNumber(data.offsetX, NAV_DEFAULTS.offsetX, 0, 400)),
    /** 垂直偏移（像素） */
    offsetY: Math.round(pickNumber(data.offsetY, NAV_DEFAULTS.offsetY, 0, 400)),
    /** 闲置不透明度 */
    idleOpacity: pickNumber(data.idleOpacity, NAV_DEFAULTS.idleOpacity, 0.1, 1)
  }
}

/** 归一面板配置 @param raw 原始配置 @return 面板配置 */
const normalizePanel = (raw: unknown): PanelSection => {
  const data = isPlainObject(raw) ? raw : {}
  return {
    /** 窗口 */
    window: normalizeWindow(data.window),
    /** 服务器 */
    server: normalizeServer(data.server)
  }
}

/** 归一服务器配置 @param raw 原始配置 @return 服务器配置 */
const normalizeServer = (raw: unknown): ServerSection => {
  const defaults = CONFIG_DEFAULTS.panel.server
  const data = isPlainObject(raw) ? raw : {}
  return {
    /** 开关 */
    switch: pickBoolean(data.switch, defaults.switch),
    /** 目录 */
    dir: pickString(data.dir, defaults.dir),
    /** 端口 */
    port: Math.round(pickNumber(data.port, defaults.port, 1, 65535)),
    /** 端口占用提示 */
    port_prompt: pickBoolean(data.port_prompt, defaults.port_prompt)
  }
}

/** 归一页面列表 @param raw 原始配置 @return 页面列表 */
const normalizeUrlList = (raw: unknown): Record<string, string> => {
  const list: Record<string, string> = {}
  if (isPlainObject(raw)) {
    Object.keys(raw).forEach(key => {
      const value = raw[key]
      // 空键与空地址无法路由，直接剔除
      if (key !== "" && typeof value === "string" && value.trim() !== "") list[key] = value
    })
  }
  return Object.keys(list).length > 0 ? list : { ...CONFIG_DEFAULTS.app.url_list }
}

/** 归一窗口配置 @param raw 原始配置 @return 窗口配置 */
const normalizeWindow = (raw: unknown): WindowSection => {
  const defaults = CONFIG_DEFAULTS.panel.window
  const data = isPlainObject(raw) ? raw : {}
  return {
    /** 宽度 */
    width: Math.round(pickNumber(data.width, defaults.width, 320, 7680)),
    /** 高度 */
    height: Math.round(pickNumber(data.height, defaults.height, 240, 4320)),
    /** 左边距 */
    x: pickCoord(data.x, defaults.x),
    /** 上边距 */
    y: pickCoord(data.y, defaults.y),
    /** 全屏 */
    fullscreen: pickBoolean(data.fullscreen, defaults.fullscreen),
    /** 无边框 */
    frame: pickBoolean(data.frame, defaults.frame),
    /** 置顶 */
    isTop: pickBoolean(data.isTop, defaults.isTop),
    /** 强制置顶 */
    isFocus: pickBoolean(data.isFocus, defaults.isFocus),
    /** 开机自启 */
    startup: pickBoolean(data.startup, defaults.startup),
    /** HTTP缓存 */
    http_cache: pickBoolean(data.http_cache, defaults.http_cache)
  }
}

/** 解析旧版四角样式字符串为锚点 @param style 内联样式 @return 导航锚点 */
const parseLegacyAnchor = (style: unknown): NavAnchor => {
  if (typeof style !== "string" || style.trim() === "") return NAV_DEFAULTS.anchor
  // 旧值形如 `left: 0; right: auto; top: 0; bottom: auto;`，只有取 0 的一侧参与定位
  const horizontal = /left\s*:\s*0/.test(style) ? "left" : /right\s*:\s*0/.test(style) ? "right" : ""
  const vertical = /top\s*:\s*0/.test(style) ? "top" : /bottom\s*:\s*0/.test(style) ? "bottom" : ""
  if (horizontal === "left" && vertical === "top") return "top-left"
  if (horizontal === "right" && vertical === "top") return "top-right"
  if (horizontal === "right" && vertical === "bottom") return "bottom-right"
  if (horizontal === "left" && vertical === "bottom") return "bottom-left"
  return NAV_DEFAULTS.anchor
}

/** 读取布尔值 @param value 原始值 @param fallback 缺省值 @return 布尔值 */
const pickBoolean = (value: unknown, fallback: boolean): boolean => (typeof value === "boolean" ? value : fallback)

/** 读取坐标值 @param value 原始值 @param fallback 缺省值 @return 坐标值 */
const pickCoord = (value: unknown, fallback: number | "center"): number | "center" => {
  if (value === "center") return "center"
  if (value === undefined || value === null || value === "") return fallback
  const num = pickNumber(value, Number.NaN, 0, 10000)
  return Number.isFinite(num) ? Math.round(num) : fallback
}

/** 读取枚举值 @param value 原始值 @param list 取值清单 @param fallback 缺省值 @return 枚举值 */
const pickEnum = <T extends string>(value: unknown, list: readonly T[], fallback: T): T => (list.indexOf(value as T) >= 0 ? (value as T) : fallback)

/** 读取索引值 @param value 原始值 @param fallback 缺省值 @return 索引字符串 */
const pickIndex = (value: unknown, fallback: string): string => {
  if (typeof value === "number" && Number.isFinite(value)) return String(Math.max(0, Math.floor(value)))
  return pickString(value, fallback)
}

/** 读取数值 @param value 原始值 @param fallback 缺省值 @param min 下限 @param max 上限 @return 收敛到区间的数值 */
const pickNumber = (value: unknown, fallback: number, min: number, max: number): number => {
  // 旧版数字字段经输入框持久化为字符串，这里一并兼容
  const num = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : Number.NaN
  if (!Number.isFinite(num)) return fallback
  return Math.min(max, Math.max(min, num))
}

/** 读取非空字符串 @param value 原始值 @param fallback 缺省值 @return 字符串 */
const pickString = (value: unknown, fallback: string): string => (typeof value === "string" && value.trim() !== "" ? value : fallback)

/** 读取配置版本 @param value 原始版本 @return 版本号 */
const readVersion = (value: unknown): number => {
  const num = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : 0
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0
}

/** 是否普通对象 @param value 原始值 @return 是否普通对象 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** 配置工具 */
export const doConfig = {
  /** 迁移旧版配置 */
  migrate: migrateConfig,
  /** 归一配置 */
  normalize: normalizeConfig
}

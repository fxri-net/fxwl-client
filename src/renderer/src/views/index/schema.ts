// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import type { StoreScope } from "@shared/defines"
import { imStore } from "@/stores"
/** 配置字段 */
export interface Field {
  /** 行标签 */
  label: string
  /** 数据路径，相对所属存储 */
  path: string
  /** 控件类型：text=文本框，switch=开关，select=下拉框，dir=目录选择 */
  type: "text" | "switch" | "select" | "dir"
  /** 栅格宽度，缺省独占一行 */
  span?: number
  /** 为第二列时左侧留白 */
  gap?: boolean
  /** 选项表，传函数可读取运行时数据（如页面列表） */
  options?: Record<string, string | number> | (() => Record<string, string | number>)
}
/** 配置分组 */
export interface Group {
  /** 分组标题，缺省时不渲染分隔线 */
  title?: string
  /** 行集合，同一行的字段并排 */
  rows: Field[][]
}
/** 配置页签 */
export interface Panel {
  /** 页签名称 */
  label: string
  /** 存储范围 */
  scope: StoreScope
  /** 分组集合 */
  groups: Group[]
}
/** 导航位置选项 */
const NAV_ANCHOR_OPTIONS: Record<string, string> = {
  "左上（默认）": "top-left",
  右上: "top-right",
  右下: "bottom-right",
  左下: "bottom-left"
}
/** 配置页签集合：配置项与存储结构一一对应，新增配置只需在此追加一行 */
export const CONFIG_PANELS: Panel[] = [
  {
    label: "应用",
    scope: "app",
    groups: [
      {
        title: "环境配置",
        rows: [
          [{ label: "应用标题", path: "title", type: "text" }],
          [{ label: "调试模式", path: "debug", type: "switch" }],
          [{ label: "默认页面", path: "url_default", type: "select", options: () => imStore.app.url_list }]
        ]
      }
    ]
  },
  {
    label: "面板",
    scope: "panel",
    groups: [
      {
        title: "窗口配置",
        rows: [
          [
            { label: "宽度", path: "window.width", type: "text", span: 12 },
            { label: "左边距", path: "window.x", type: "text", span: 12, gap: true }
          ],
          [
            { label: "高度", path: "window.height", type: "text", span: 12 },
            { label: "上边距", path: "window.y", type: "text", span: 12, gap: true }
          ],
          [
            { label: "开机自启", path: "window.startup", type: "switch", span: 4 },
            { label: "全屏", path: "window.fullscreen", type: "switch", span: 4 },
            { label: "无边框", path: "window.frame", type: "switch", span: 4 },
            { label: "置顶", path: "window.isTop", type: "switch", span: 4 },
            { label: "强制置顶", path: "window.isFocus", type: "switch", span: 4 },
            { label: "HTTP缓存", path: "window.http_cache", type: "switch", span: 4 }
          ]
        ]
      },
      {
        title: "网站配置",
        rows: [
          [
            { label: "开关", path: "server.switch", type: "switch", span: 12 },
            { label: "端口占用提示", path: "server.port_prompt", type: "switch", span: 12, gap: true }
          ],
          [
            { label: "目录", path: "server.dir", type: "dir", span: 12 },
            { label: "端口", path: "server.port", type: "text", span: 12, gap: true }
          ]
        ]
      }
    ]
  },
  {
    label: "客户端",
    scope: "client",
    groups: [
      {
        title: "环境配置",
        rows: [
          [{ label: "页面地址（HTTP）", path: "url_host", type: "text" }],
          [{ label: "导航位置", path: "nav.anchor", type: "select", options: NAV_ANCHOR_OPTIONS }],
          [
            { label: "水平偏移（像素）", path: "nav.offsetX", type: "text", span: 12 },
            { label: "垂直偏移（像素）", path: "nav.offsetY", type: "text", span: 12, gap: true }
          ]
        ]
      }
    ]
  }
]
/**
 * 按路径读取字段值
 * @param data 字段所属数据
 * @param path 点分路径，如 window.width
 * @return 字段值
 * @example readField(imStore.panel, "window.width")
 */
export function readField(data: any, path: string): any {
  return path.split(".").reduce(function (acc: any, key: string) {
    // 路径断开时返回空值，避免渲染报错
    return acc == null ? acc : acc[key]
  }, data)
}
/**
 * 按路径写入字段值
 * @param data 字段所属数据
 * @param path 点分路径，如 window.width
 * @param value 字段值
 * @example writeField(imStore.panel, "window.width", 1280)
 */
export function writeField(data: any, path: string, value: any): void {
  /** 路径片段 */
  const keys = path.split(".")
  /** 末级字段名 */
  const last = keys.pop() as string
  /** 末级字段所属对象 */
  const target = keys.reduce(function (acc: any, key: string) {
    return acc[key]
  }, data)
  target[last] = value
}

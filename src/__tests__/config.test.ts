// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { describe, expect, it } from "vitest"
import { CONFIG_DEFAULTS, CONFIG_VERSION, doConfig } from "../shared/config"

/** 旧版四角样式 */
const legacyStyles = {
  "top-left": "left: 0; right: auto; top: 0; bottom: auto;",
  "top-right": "left: auto; right: 0; top: 0; bottom: auto;",
  "bottom-right": "left: auto; right: 0; top: auto; bottom: 0;",
  "bottom-left": "left: 0; right: auto; top: auto; bottom: 0;"
}

describe("配置迁移", () => {
  it("把四角样式字符串映射为锚点", () => {
    Object.keys(legacyStyles).forEach(anchor => {
      const config = doConfig.migrate({ client: { back_btn: legacyStyles[anchor as keyof typeof legacyStyles] } })
      expect(config.client.nav.anchor).toBe(anchor)
    })
  })

  it("未知样式回落左上锚点", () => {
    const config = doConfig.migrate({ client: { back_btn: "position: fixed;" } })
    expect(config.client.nav.anchor).toBe("top-left")
    expect(config.version).toBe(CONFIG_VERSION)
  })

  it("丢弃废弃的四角选项表", () => {
    const config = doConfig.migrate({ app: { back_btns: legacyStyles } })
    expect(Object.prototype.hasOwnProperty.call(config.app, "back_btns")).toBe(false)
  })

  it("已有导航配置时保留原值", () => {
    const config = doConfig.migrate({
      client: { back_btn: legacyStyles["top-right"], nav: { anchor: "bottom-left" } }
    })
    expect(config.client.nav.anchor).toBe("bottom-left")
  })
})

describe("配置归一", () => {
  it("缺字段补齐默认值", () => {
    expect(doConfig.normalize({})).toEqual(CONFIG_DEFAULTS)
  })

  it("数字字符串归一为数值", () => {
    const config = doConfig.normalize({
      panel: { window: { width: "1600", height: "900" }, server: { port: "3000" } }
    })
    expect(config.panel.window.width).toBe(1600)
    expect(config.panel.window.height).toBe(900)
    expect(config.panel.server.port).toBe(3000)
  })

  it("越界数值收敛到区间边界", () => {
    const config = doConfig.normalize({
      panel: { window: { width: 100 }, server: { port: 70000 } },
      client: { nav: { offsetX: -20, idleOpacity: 5 } }
    })
    expect(config.panel.window.width).toBe(320)
    expect(config.panel.server.port).toBe(65535)
    expect(config.client.nav.offsetX).toBe(0)
    expect(config.client.nav.idleOpacity).toBe(1)
  })

  it("未知取值回落默认值", () => {
    const config = doConfig.normalize({
      app: { store_name: "other", url_default: "/missing" },
      client: { nav: { anchor: "middle" } }
    })
    expect(config.app.store_name).toBe("app")
    expect(config.app.url_default).toBe("/")
    expect(config.client.nav.anchor).toBe("top-left")
  })

  it("剔除未知键", () => {
    const config = doConfig.normalize({ app: { unknown: 1 }, extra: true })
    expect(Object.prototype.hasOwnProperty.call(config.app, "unknown")).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(config, "extra")).toBe(false)
  })

  it("返回独立副本，不污染默认值", () => {
    const config = doConfig.normalize({})
    config.app.url_list.首页 = "/changed"
    config.client.nav.anchor = "bottom-right"
    expect(doConfig.normalize({}).app.url_list.首页).toBe("/")
    expect(CONFIG_DEFAULTS.app.url_list.首页).toBe("/")
    expect(CONFIG_DEFAULTS.client.nav.anchor).toBe("top-left")
  })
})

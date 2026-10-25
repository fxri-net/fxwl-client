// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { describe, expect, it } from "vitest"
import { IPC_CHANNEL, IPC_VALIDATORS } from "./contract"

describe("通道契约", () => {
  it("每个通道常量都有对应校验器", () => {
    const channels = Object.values(IPC_CHANNEL)
    expect(channels.length).toBe(Object.keys(IPC_VALIDATORS).length)
    channels.forEach(channel => {
      expect(IPC_VALIDATORS[channel]).toBeTypeOf("function")
    })
  })

  it("空入参通道拒绝多余参数", () => {
    expect(IPC_VALIDATORS["app:version"](undefined)).toBeNull()
    expect(IPC_VALIDATORS["app:version"]({})).toContain("不接受入参")
  })

  it("存储范围只接受三个合法值", () => {
    expect(IPC_VALIDATORS["config:get"]({ scope: "app" })).toBeNull()
    expect(IPC_VALIDATORS["config:get"]({ scope: "panel" })).toBeNull()
    expect(IPC_VALIDATORS["config:get"]({ scope: "other" })).toContain("存储范围")
    expect(IPC_VALIDATORS["config:get"](null)).toContain("对象")
  })

  it("配置写入要求对象数据", () => {
    expect(IPC_VALIDATORS["config:set"]({ scope: "client", data: {} })).toBeNull()
    expect(IPC_VALIDATORS["config:set"]({ scope: "client", data: [] })).toContain("配置数据")
    expect(IPC_VALIDATORS["config:set"]({ scope: "client" })).toContain("配置数据")
    expect(IPC_VALIDATORS["config:set"]({ scope: "other", data: {} })).toContain("存储范围")
  })

  it("端口必须是 1 到 65535 的整数", () => {
    expect(IPC_VALIDATORS["service:port"]({ port: 2602 })).toBeNull()
    expect(IPC_VALIDATORS["service:port"]({ port: 0 })).toContain("端口")
    expect(IPC_VALIDATORS["service:port"]({ port: 65536 })).toContain("端口")
    expect(IPC_VALIDATORS["service:port"]({ port: 2602.5 })).toContain("端口")
    expect(IPC_VALIDATORS["service:port"]({ port: "2602" })).toContain("端口")
    expect(IPC_VALIDATORS["service:port"](null)).toContain("对象")
  })

  it("选择目录入参可省略标题", () => {
    expect(IPC_VALIDATORS["dialog:openDirectory"](undefined)).toBeNull()
    expect(IPC_VALIDATORS["dialog:openDirectory"]({ title: "选择目录" })).toBeNull()
    expect(IPC_VALIDATORS["dialog:openDirectory"]({ title: 1 })).toContain("标题")
  })
})

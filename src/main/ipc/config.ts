// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { CONFIG_DEFAULTS, doConfig } from "@shared/config"
import { IPC_CHANNEL } from "@shared/contract"
import type { AppConfig } from "@shared/config"
import { doStore } from "../service/store"
import { doHandle } from "./register"
/** 读取归一配置，磁盘内容与归一结果不一致时回写 @return 完整配置 */
function doRead(): AppConfig {
  /** 磁盘原始配置 */
  const raw = doStore.all()
  /** 归一后的配置 */
  const config = doConfig.migrate(raw)
  // 旧版配置缺版本号或含冗余键时按归一结果落盘，顺带清掉历史遗留的嵌套结构
  if (JSON.stringify(config) != JSON.stringify(raw)) doStore.set(config)
  return config
}
/** 配置域事件 */
export const doIpcConfig = {
  /** 注册事件 */
  register: function (): void {
    // 读取配置：只回传请求范围的归一结果
    doHandle(IPC_CHANNEL.ConfigGet, function (param) {
      /** 完整配置 */
      const config = doRead()
      return config[param.scope] as unknown as Record<string, unknown>
    })
    // 写入配置：先并入当前配置再归一，落盘内容始终满足 schema
    doHandle(IPC_CHANNEL.ConfigSet, function (param) {
      /** 归一后的完整配置 */
      const next = doConfig.normalize({ ...doRead(), [param.scope]: param.data })
      doStore.set({ [param.scope]: next[param.scope], version: next.version })
    })
    // 重置配置：只覆盖请求范围，其余范围保持原值
    doHandle(IPC_CHANNEL.ConfigReset, function (param) {
      doStore.set({ [param.scope]: CONFIG_DEFAULTS[param.scope], version: CONFIG_DEFAULTS.version })
    })
    // 配置目录
    doHandle(IPC_CHANNEL.ConfigDir, () => doStore.dir)
  }
}

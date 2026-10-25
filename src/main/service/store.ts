// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { app } from "electron"
import Store from "electron-store"
import path from "path"
import { doMigrate } from "./migrate"
/** 配置目录：迁移可用时为用户数据目录，否则退回历史目录 */
const dir = path.resolve(doMigrate.prepare(), "config")
/** 存储实例 */
const store = new Store({
  cwd: dir
})
/** 存储服务 */
export const doStore = {
  /** 配置目录 */
  dir: dir,
  /** 读取全部配置 @return 完整配置 */
  all: function (): Record<string, any> {
    return store.store
  },
  /** 读取数据 @param key 配置键 @return 配置值 */
  get: function (key: string): any {
    return store.get(key)
  },
  /** 写入数据 @param data 配置集合 */
  set: function (data: Record<string, any>): void {
    store.set(data)
    // 开机自启随配置联动
    const startup = data?.panel?.window?.startup
    if (typeof startup != "boolean") return
    app.setLoginItemSettings({
      // 注册或注销开机自启
      openAtLogin: startup,
      // 启动时不隐藏窗口
      openAsHidden: false,
      path: process.execPath,
      args: ["--processStart", `"${path.basename(process.execPath)}"`]
    })
  }
}

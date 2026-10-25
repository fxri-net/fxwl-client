// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { app } from "electron"
import Store from "electron-store"
import path from "path"
import { doEnv } from "../env"
/** 存储实例 */
const store = new Store({
  cwd: path.resolve(doEnv.localDir, "config")
})
/** 存储服务 */
export const doStore = {
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

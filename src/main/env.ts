// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { app } from "electron"
import { is } from "@electron-toolkit/utils"
import path from "path"
/** 根路径（打包后为可执行文件上级，开发时为仓库根） */
const root = app.isPackaged ? path.resolve(app.getPath("exe"), "..") : path.resolve(app.getAppPath())
/** 本地数据目录 */
const localDir = app.isPackaged ? path.resolve(root, "../fxwl-local") : root
/** 环境配置 */
export const doEnv: {
  /** 开发地址 */
  devUrl: string
  /** 本地数据目录 */
  localDir: string
  /** 是否打包 */
  packaged: boolean
  /** 根路径 */
  root: string
  /** 应用开关 @param httpCache HTTP 缓存开关 */
  applySwitch: (httpCache: boolean | undefined) => void
} = {
  devUrl: is.dev ? process.env["ELECTRON_RENDERER_URL"] ?? "" : "",
  localDir: localDir,
  packaged: app.isPackaged,
  root: root,
  applySwitch: function (httpCache: boolean | undefined): void {
    // 命令行开关须在应用 ready 之前设置
    if (httpCache != false) return
    app.commandLine.appendSwitch("--disable-http-cache")
  }
}

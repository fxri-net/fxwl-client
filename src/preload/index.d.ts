// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { ElectronAPI } from "@electron-toolkit/preload"
declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    /**
     * 本地模块
     */
    doNative: object
  }
  /**
   * 本地模块
   */
  const doNative: {
    /**
     * 重启应用
     */
    restart: function
    /**
     * 退出应用
     */
    quit: function
    /**
     * 命令脚本
     */
    shell: function
    /**
     * 数据存储
     */
    store: any
    /**
     * 打开文件
     */
    openFile: function
  }
}

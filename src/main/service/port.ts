// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import shell from "child_process"
/** 端口服务 */
export const doPort = {
  /** 检测端口是否被占用 @param port 端口 @return 是否占用 */
  check: function (port: number): Promise<boolean> {
    return new Promise((resolve) => {
      // LISTENING 记录非空即视为占用
      shell.exec('netstat -ano | findstr /R "' + port + '.*LISTENING"', (_error, stdout) => {
        resolve(stdout != "")
      })
    })
  }
}

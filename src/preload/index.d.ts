// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import type { NativeBridge } from "@shared/contract"
declare global {
  interface Window {
    /** 本地桥 */
    doNative: NativeBridge
  }
  /** 本地桥 */
  const doNative: NativeBridge
}
export {}

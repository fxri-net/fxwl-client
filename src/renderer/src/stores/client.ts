// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { reactive } from "vue"
import { doParam } from "@/libs/module"
import { doData } from "@/libs/obj"
/** 数据 */
const data = {
  /** 页面地址 */
  url_host: "http://127.0.0.1:2602",
  /** 返回按钮 */
  back_btn: ""
}
/** 存储 */
const store = reactive(doData.clone(data) as typeof data)
// 监听存储
doParam.watch("client", store)
// 导出存储
export default { data, store }

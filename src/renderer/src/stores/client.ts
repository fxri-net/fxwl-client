// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { defineStore } from "pinia"
// 定义数据
const data = {
  /** 页面地址 */
  url_host: "http://127.0.0.1:2602",
  /** 返回按钮 */
  back_btn: ""
}
// 定义存储
const store = defineStore("client", {
  state: () => JSON.parse(JSON.stringify(data)),
  persist: true
})
export default { store: store, data: data }

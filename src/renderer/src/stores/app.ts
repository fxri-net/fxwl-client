// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { defineStore } from "pinia"
// 定义数据
const data = {
  /** 标题 */
  title: "方弦物联",
  /** 调试模式 */
  debug: false,
  /** 默认页面 */
  url_default: "/",
  /** 页面列表 */
  url_list: {
    首页: "/",
    配置项: "/config",
    客户端: "/client/index"
  },
  /** 面板索引 */
  panel_index: "0",
  /** 返回按钮组 */
  back_btns: {
    "左上（默认）": "left: 0; right: auto; top: 0; bottom: auto;",
    右上: "left: auto; right: 0; top: 0; bottom: auto;",
    右下: "left: auto; right: 0; top: auto; bottom: 0;",
    左下: "left: 0; right: auto; top: auto; bottom: 0;"
  }
}
// 定义存储
const store = defineStore("app", {
  state: () => JSON.parse(JSON.stringify(data)),
  persist: true
})
export default { store: store, data: data }

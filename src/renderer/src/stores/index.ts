// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { createPinia } from "pinia"
// 引入持久化插件
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
// 初始化pinia
const store = createPinia()
// 使用该插件
store.use(piniaPluginPersistedstate)
// 导出存储
export default store

// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // 默认 node 环境，渲染层纯函数无需浏览器环境
    environment: "node",
    // 测试文件与被测代码同目录
    include: ["src/**/*.{test,spec}.ts"],
    // 尚未铺开用例时不阻断验收
    passWithNoTests: true
  }
})

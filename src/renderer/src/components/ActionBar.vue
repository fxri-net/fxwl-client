<script setup lang="ts">
import { flushBridge } from "@/composables/useBridge"
import { imApp, imView } from "@/libs/base"
import { doView } from "@/libs/nav"
/** 清理缓存 */
async function cleanCache() {
  // 清空参数
  imApp.param.value = {}
  imView.deploy.value = {}
  // 刷新页面
  await reloadPage()
}
/** 刷新页面 */
async function reloadPage() {
  // 先落盘再刷新，避免防抖窗口内的修改丢失
  await flushBridge()
  window.location.reload()
}
/** 重启应用 */
async function restartApp() {
  // 先落盘再重启，避免防抖窗口内的修改丢失
  await flushBridge()
  doNative.app.restart()
}
/** 退出应用 */
async function exitApp() {
  // 先落盘再退出，避免防抖窗口内的修改丢失
  await flushBridge()
  doNative.app.quit()
}
</script>

<template>
  <div class="fx-action">
    <div class="action-left">
      <el-button type="success" @click="reloadPage">刷新页面</el-button>
      <!-- 页面自有动作插在此处 -->
      <slot />
      <el-button @click="cleanCache">清理缓存</el-button>
      <el-button @click="doView.jump('/')">返回首页</el-button>
    </div>
    <div class="action-right">
      <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="重启应用程序?" @confirm="restartApp">
        <template #reference>
          <el-button type="warning">重启应用</el-button>
        </template>
      </el-popconfirm>
      <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="关闭应用程序?" @confirm="exitApp">
        <template #reference>
          <el-button type="danger">退出应用</el-button>
        </template>
      </el-popconfirm>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fx-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fx-space-md);
}

.action-left,
.action-right {
  display: flex;
  align-items: center;
  gap: var(--fx-space-md);
}
</style>

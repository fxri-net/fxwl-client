<script setup lang="ts">
import { computed, reactive } from "vue"
import { CLIENT_PARTITION } from "@shared/defines"
import { doView } from "@/libs/nav"
import { imStore } from "@/stores"
/** 数据集合 */
const datas = reactive({
  /** 是否正在加载 */
  loading: true,
  /** 加载失败信息，空串表示无错误 */
  error: "",
  /** 重建计数，递增后强制重建内嵌页 */
  rebuild: 0
})
/** 内嵌页键值，宿主地址或重建计数变化时重建 */
const boxKey = computed(function () {
  return imStore.client.url_host + "#" + datas.rebuild
})
/** 宿主地址是否可加载 */
const canLoad = computed(function () {
  return /^https?:\/\//i.test(imStore.client.url_host)
})
/** 开始加载 */
function startLoad() {
  datas.loading = true
  datas.error = ""
}
/** 结束加载 */
function stopLoad() {
  datas.loading = false
}
/** 处理加载失败 */
function failLoad(event: { errorCode: number; errorDescription: string; isMainFrame: boolean }) {
  // 子框架失败不影响整体展示，错误码 -3 表示导航被主动取消
  if (event.isMainFrame === false || event.errorCode == -3) return
  datas.loading = false
  datas.error = event.errorDescription || "内嵌页加载失败"
}
/** 重试加载 */
function retry() {
  // 递增键值让失败的页面连同 guest 一起被销毁重建
  datas.error = ""
  datas.loading = true
  datas.rebuild++
}
/** 离开页面 */
function leavePage() {
  // 跳转到首页，内嵌页随组件卸载销毁
  doView.jump("/")
}
</script>

<template>
  <div class="fxy-layout">
    <div class="fxy-header">
      <div class="back" @click="leavePage"></div>
    </div>
    <div class="fxy-panel">
      <webview
        v-if="canLoad"
        :key="boxKey"
        class="box"
        :partition="CLIENT_PARTITION"
        :src="imStore.client.url_host"
        @did-start-loading="startLoad"
        @did-stop-loading="stopLoad"
        @did-fail-load="failLoad"
      ></webview>
      <!-- 状态面板：未配置、加载中、加载失败三种情形 -->
      <div v-if="!canLoad || datas.error != '' || datas.loading" class="state">
        <template v-if="!canLoad">
          <p class="state-text">尚未配置客户端地址</p>
          <p class="state-tip">请前往「配置 - 客户端」填写页面地址</p>
        </template>
        <template v-else-if="datas.error != ''">
          <p class="state-text">内嵌页加载失败</p>
          <p class="state-tip">{{ datas.error }}</p>
          <p class="state-tip">{{ imStore.client.url_host }}</p>
          <el-button type="primary" @click="retry">重试</el-button>
        </template>
        <template v-else>
          <div class="state-spinner"></div>
          <p class="state-tip">正在加载…</p>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fxy-layout {
  font-family: "KaiTi";
  font-weight: bold;
  color: #ffffff;
  cursor: default;
  user-select: none;
}

.fxy-header {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 999;
}

.fxy-header .back {
  position: fixed;
  left: 0;
  top: 0;
  width: 160px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fxy-header .back:hover {
  background: rgba($color: #fff, $alpha: 0.1);
}

.fxy-panel {
  position: relative;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
}

.fxy-panel .box {
  width: 100%;
  height: 100%;
}

.state {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--fxy-space-md);
  background: var(--fxy-color-bg);
  color: var(--fxy-color-text);
  font-weight: normal;
}

.state-text {
  margin: 0;
  font-size: 18px;
}

.state-tip {
  margin: 0;
  font-size: 14px;
  color: var(--fxy-color-text-secondary);
}

.state-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--el-color-primary-light-7);
  border-top-color: var(--fxy-color-primary);
  border-radius: 50%;
  animation: state-spin 0.8s linear infinite;
}

@keyframes state-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

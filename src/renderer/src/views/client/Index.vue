<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import type { ClientShortcut } from "@shared/contract"
import { CLIENT_PARTITION } from "@shared/defines"
import { doView } from "@/libs/nav"
import { imStore } from "@/stores"
/** 内嵌页元素能力 */
interface Guest {
  /** 是否可后退 */
  canGoBack: () => boolean
  /** 后退 */
  goBack: () => void
  /** 重新加载 */
  reload: () => void
}
/** 元素集合 */
const elems = {
  /** 内嵌页元素 */
  box: ref<Guest | null>(null)
}
/** 数据集合 */
const datas = reactive({
  /** 是否正在加载 */
  loading: true,
  /** 加载失败信息，空串表示无错误 */
  error: "",
  /** 加载失败错误码 */
  errorCode: 0,
  /** 内嵌页当前是否可后退 */
  canBack: false,
  /** 胶囊激活计数，快捷键触发时递增 */
  flash: 0
})
/** 取消快捷键订阅 */
let offShortcut: (() => void) | undefined
/** 宿主地址是否可加载 */
const canLoad = computed(function () {
  return /^https?:\/\//i.test(imStore.client.url_host)
})
/** 开始加载 */
function startLoad() {
  datas.loading = true
  datas.error = ""
  datas.errorCode = 0
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
  datas.errorCode = event.errorCode
}
/** 重试加载 */
function retry() {
  // 就地重载，保留会话与历史，避免整页重建带来的闪烁
  datas.error = ""
  datas.errorCode = 0
  datas.loading = true
  elems.box.value?.reload()
}
/** 同步后退可用状态 */
function syncBack() {
  /** 内嵌页元素 */
  const box = elems.box.value
  datas.canBack = box != null && box.canGoBack()
}
/** 内嵌页后退 */
function goBack() {
  elems.box.value?.goBack()
}
/** 离开页面 */
function leavePage() {
  // 跳转到首页，内嵌页随组件卸载销毁
  doView.jump("/")
}
/** 处理内嵌页快捷键 */
function handleShortcut(shortcut: ClientShortcut) {
  // 焦点在页面内时宿主状态可能滞后，先补一次后退可用性
  syncBack()
  datas.flash++
  // Esc 已在起始页时没有可后退历史，按退出处理
  if (shortcut == "back" || datas.canBack) {
    goBack()
    return
  }
  leavePage()
}
onMounted(function () {
  // 纯浏览器环境没有原生通道
  if (window.doNative == undefined) return
  offShortcut = window.doNative.client.onShortcut(handleShortcut)
})
onBeforeUnmount(function () {
  offShortcut?.()
})
</script>

<template>
  <div class="fx-layout">
    <div class="fx-panel">
      <webview
        v-if="canLoad"
        :key="imStore.client.url_host"
        :ref="elems.box"
        class="box"
        :partition="CLIENT_PARTITION"
        :src="imStore.client.url_host"
        @dom-ready="syncBack"
        @did-start-loading="startLoad"
        @did-stop-loading="stopLoad"
        @did-fail-load="failLoad"
        @did-navigate="syncBack"
        @did-navigate-in-page="syncBack"
      ></webview>
      <!-- 状态面板：未配置、加载中、加载失败三种情形 -->
      <div v-if="!canLoad || datas.error != '' || datas.loading" class="state">
        <template v-if="!canLoad">
          <p class="state-text">尚未配置客户端地址</p>
          <p class="state-tip">请前往「配置 - 客户端」填写页面地址</p>
        </template>
        <template v-else-if="datas.error != ''">
          <p class="state-text">内嵌页加载失败</p>
          <p class="state-tip">{{ datas.error }}（错误码 {{ datas.errorCode }}）</p>
          <p class="state-tip">{{ imStore.client.url_host }}</p>
          <div class="state-actions">
            <el-button type="primary" @click="retry">重试</el-button>
            <el-button @click="leavePage">返回首页</el-button>
          </div>
        </template>
        <template v-else>
          <div class="state-spinner"></div>
          <p class="state-tip">正在加载…</p>
        </template>
      </div>
    </div>
    <NavCapsule
      :can-back="datas.canBack"
      :anchor="imStore.client.nav.anchor"
      :offset-x="imStore.client.nav.offsetX"
      :offset-y="imStore.client.nav.offsetY"
      :flash="datas.flash"
      @back="goBack"
      @exit="leavePage"
    />
  </div>
</template>

<style lang="scss" scoped>
.fx-layout {
  font-family: "KaiTi";
  font-weight: bold;
  color: #ffffff;
  cursor: default;
  user-select: none;
}

.fx-panel {
  position: relative;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
}

.fx-panel .box {
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
  gap: var(--fx-space-md);
  background: var(--fx-color-bg);
  color: var(--fx-color-text);
  font-weight: normal;
}

.state-text {
  margin: 0;
  font-size: 18px;
}

.state-tip {
  margin: 0;
  font-size: 14px;
  color: var(--fx-color-text-secondary);
}

.state-actions {
  display: flex;
  gap: var(--fx-space-md);
}

.state-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--el-color-primary-light-7);
  border-top-color: var(--fx-color-primary);
  border-radius: 50%;
  animation: state-spin 0.8s linear infinite;
}

@keyframes state-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

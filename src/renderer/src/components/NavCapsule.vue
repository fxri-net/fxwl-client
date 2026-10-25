<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive } from "vue"
import type { NavAnchor } from "@shared/defines"
/** 定义集合 */
interface Defines {
  /** 是否可后退 */
  canBack: boolean
  /** 停靠锚点 */
  anchor: NavAnchor
  /** 水平偏移（像素） */
  offsetX: number
  /** 垂直偏移（像素） */
  offsetY: number
  /** 闲置不透明度 */
  idleOpacity: number
}
const props = defineProps<Defines>()
/** 派发选项 */
const emit = defineEmits<{
  /** 后退 */
  back: []
  /** 退出内嵌页 */
  exit: []
}>()
/** 静止多久后淡出（毫秒） */
const IDLE_DELAY = 3000
/** 数据集合 */
const datas = reactive({
  /** 是否激活，激活时保持满不透明 */
  active: true
})
/** 淡出计时器 */
let timer: number | undefined
/** 胶囊定位：按锚点把水平、垂直偏移落到对应边 */
const capsuleStyle = computed(function () {
  /** 水平方向 */
  const horizontal = props.anchor.indexOf("left") >= 0 ? "left" : "right"
  /** 垂直方向 */
  const vertical = props.anchor.indexOf("top") == 0 ? "top" : "bottom"
  return {
    [horizontal]: props.offsetX + "px",
    [vertical]: props.offsetY + "px",
    "--nav-idle-opacity": String(props.idleOpacity)
  }
})
/** 进入交互：立即满不透明并暂停淡出 */
function enterActive() {
  window.clearTimeout(timer)
  datas.active = true
}
/** 离开交互：静止一段时间后淡出 */
function leaveActive() {
  window.clearTimeout(timer)
  timer = window.setTimeout(function () {
    datas.active = false
  }, IDLE_DELAY)
}
onMounted(function () {
  // 首次进入完整显示，作为一次性引导
  leaveActive()
})
onBeforeUnmount(function () {
  window.clearTimeout(timer)
})
</script>

<template>
  <div
    class="capsule"
    :class="{ 'is-active': datas.active }"
    :style="capsuleStyle"
    @pointerenter="enterActive"
    @pointerleave="leaveActive"
    @focusin="enterActive"
    @focusout="leaveActive"
  >
    <button v-if="canBack" type="button" class="item" title="后退" @click="emit('back')">后退</button>
    <button type="button" class="item" title="退出内嵌页" @click="emit('exit')">退出</button>
  </div>
</template>

<style lang="scss" scoped>
.capsule {
  position: fixed;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border: 1px solid var(--el-color-info-light-8);
  border-radius: 999px;
  background: var(--fxy-color-bg);
  box-shadow: 0 4px 16px rgba($color: #000000, $alpha: 0.18);
  opacity: var(--nav-idle-opacity, 0.35);
  transition: opacity 160ms ease;
}

.capsule.is-active {
  opacity: 1;
}

.item {
  min-width: 48px;
  min-height: 40px;
  padding: 0 var(--fxy-space-md);
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--fxy-color-text);
  font-family: inherit;
  font-size: 14px;
  font-weight: normal;
  cursor: pointer;
}

.item:hover {
  background: var(--el-color-primary-light-9);
  color: var(--fxy-color-primary);
}

.item:focus-visible {
  outline: 2px solid var(--fxy-color-primary);
  outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
  .capsule {
    transition: none;
  }
}
</style>

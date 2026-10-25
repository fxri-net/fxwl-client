<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, watch } from "vue"
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
  /** 激活计数，递增时重新显示 */
  flash: number
}
const props = defineProps<Defines>()
/** 派发选项 */
const emit = defineEmits<{
  /** 后退 */
  back: []
  /** 返回首页 */
  exit: []
}>()
/** 静止多久后隐藏（毫秒） */
const IDLE_DELAY = 3000
/** 热区相对胶囊外扩的边距（像素） */
const HOTSPOT_PAD = 10
/** 隐藏时向锚点侧收起的距离（像素） */
const EDGE_SHIFT = 6
/** 数据集合 */
const datas = reactive({
  /** 是否显示，显示时接管指针事件 */
  active: false
})
/** 隐藏计时器 */
let timer: number | undefined
/** 热区定位：与胶囊同边并外扩出可命中边距，隐藏时胶囊向锚点侧收进 */
const hotspotStyle = computed(function () {
  /** 水平方向 */
  const horizontal = props.anchor.indexOf("left") >= 0 ? "left" : "right"
  /** 垂直方向 */
  const vertical = props.anchor.indexOf("top") == 0 ? "top" : "bottom"
  return {
    [horizontal]: props.offsetX - HOTSPOT_PAD + "px",
    [vertical]: props.offsetY - HOTSPOT_PAD + "px",
    "--nav-pad": HOTSPOT_PAD + "px",
    "--nav-shift-x": (horizontal == "left" ? -EDGE_SHIFT : EDGE_SHIFT) + "px",
    "--nav-shift-y": (vertical == "top" ? -EDGE_SHIFT : EDGE_SHIFT) + "px"
  }
})
/** 进入交互：立即显示并暂停隐藏 */
function enterActive() {
  window.clearTimeout(timer)
  datas.active = true
}
/** 离开交互：静止一段时间后隐藏 */
function leaveActive() {
  window.clearTimeout(timer)
  timer = window.setTimeout(function () {
    datas.active = false
  }, IDLE_DELAY)
}
watch(
  function () {
    return props.flash
  },
  function () {
    // 快捷键触发后短暂亮相，让用户知道导航仍在原处
    enterActive()
    leaveActive()
  }
)
onMounted(function () {
  // 首次进入完整显示，作为一次性引导
  enterActive()
  leaveActive()
})
onBeforeUnmount(function () {
  window.clearTimeout(timer)
})
</script>

<template>
  <div
    class="hotspot"
    :style="hotspotStyle"
    @pointerenter="enterActive"
    @pointerleave="leaveActive"
    @focusin="enterActive"
    @focusout="leaveActive"
  >
    <div class="capsule" :class="{ 'is-active': datas.active }">
      <button v-if="canBack" type="button" class="item" title="后退" @click="emit('back')">后退</button>
      <button type="button" class="item" title="返回首页" @click="emit('exit')">返回首页</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hotspot {
  position: fixed;
  z-index: 1000;
  padding: var(--nav-pad, 10px);
}

.capsule {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border: 1px solid var(--el-color-info-light-8);
  border-radius: 999px;
  background: var(--fx-color-bg);
  box-shadow: 0 4px 16px rgba($color: #000000, $alpha: 0.18);
  opacity: 0;
  pointer-events: none;
  transform: translate(var(--nav-shift-x, 0), var(--nav-shift-y, 0));
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.capsule.is-active {
  opacity: 1;
  pointer-events: auto;
  transform: none;
}

.item {
  min-width: 48px;
  min-height: 40px;
  padding: 0 var(--fx-space-md);
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--fx-color-text);
  font-family: inherit;
  font-size: 14px;
  font-weight: normal;
  cursor: pointer;
}

.item:hover {
  background: var(--el-color-primary-light-9);
  color: var(--fx-color-primary);
}

.item:focus-visible {
  outline: 2px solid var(--fx-color-primary);
  outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
  .capsule {
    transition: none;
  }
}
</style>

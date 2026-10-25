<script setup lang="ts">
import { onMounted, ref } from "vue"
/** 版本号 */
const version = ref("")
// 挂载后读取应用版本，读取失败时保持空文案
onMounted(function () {
  // 纯浏览器环境没有原生通道
  if (window.doNative == undefined) return
  window.doNative.app.version().then(function (res) {
    version.value = "v" + res
  })
})
</script>

<template>
  <div class="fxy-footer">
    <div class="footer-body">
      <slot />
    </div>
    <span class="footer-version">{{ version }}</span>
  </div>
</template>

<style lang="scss" scoped>
.fxy-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #fff;
}

.footer-body {
  flex: 1;
  min-width: 0;
}

.footer-version {
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
}
</style>

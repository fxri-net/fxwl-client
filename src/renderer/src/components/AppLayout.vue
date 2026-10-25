<template>
  <div class="fxy-layout">
    <div v-if="$slots.header" class="fxy-header">
      <slot name="header" />
    </div>
    <div class="fxy-panel">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fxy-header {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 999;
}

.fxy-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  /* 底部留出固定底栏的高度 */
  padding: 10px 10px 52px 10px;
}
</style>

<template>
  <div class="fx-layout">
    <div v-if="$slots.header" class="fx-header">
      <slot name="header" />
    </div>
    <div class="fx-panel">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fx-header {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 999;
}

.fx-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  /* 底部留出固定底栏的高度 */
  padding: var(--fx-space-md) var(--fx-space-md) var(--fx-footer-height);
}
</style>

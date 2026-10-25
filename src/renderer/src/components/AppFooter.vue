<template>
  <div class="fx-footer">
    <div class="footer-body">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fx-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: var(--fx-space-md);
  padding: var(--fx-space-md);
  background: var(--fx-color-bg);
}

.footer-body {
  flex: 1;
  min-width: 0;
}
</style>

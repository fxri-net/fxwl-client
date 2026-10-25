<script setup lang="ts">
/** 定义集合 */
interface Defines {
  /** 行标签 */
  label: string
}
defineProps<Defines>()
</script>

<template>
  <el-form-item :label="label">
    <slot />
  </el-form-item>
</template>

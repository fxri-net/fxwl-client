<script setup lang="ts">
/** 定义集合 */
interface Defines {
  /** 开关标签 */
  label: string
}
defineProps<Defines>()
/** 开关状态 */
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <el-form-item :label="label">
    <el-switch v-model="model" size="large" inline-prompt style="--el-switch-on-color: var(--fxy-color-switch)" active-text="开启" inactive-text="关闭" />
  </el-form-item>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { isBlank } from "@/libs/is"
import { readField, writeField } from "@/views/index/schema"
import type { Field } from "@/views/index/schema"
/** 定义集合 */
interface Defines {
  /** 字段定义 */
  field: Field
  /** 字段所属数据 */
  data: any
}
const props = defineProps<Defines>()
/** 字段值 */
const model = computed({
  get: () => readField(props.data, props.field.path),
  set: (value: any) => writeField(props.data, props.field.path, value)
})
/** 选项表 */
const options = computed(function () {
  /** 选项定义 */
  const options = props.field.options
  return (typeof options === "function" ? options() : options) ?? {}
})
/** 选择目录 */
async function chooseDir() {
  /** 选中的目录，取消时为 null */
  const dir = await doNative.dialog.openDirectory("选择目录")
  if (dir == null || isBlank(dir)) return
  model.value = dir
}
</script>

<template>
  <SettingSwitch v-if="field.type === 'switch'" v-model="model" :label="field.label" />
  <SettingField v-else :label="field.label">
    <el-select v-if="field.type === 'select'" v-model="model" :placeholder="'选择' + field.label" size="large">
      <el-option v-for="(item, index) in options" :key="index" :label="index" :value="item" />
    </el-select>
    <template v-else-if="field.type === 'dir'">
      <el-input v-model="model" type="text" autocomplete="off" style="width: calc(100% - 88px)" />
      <el-button type="warning" @click="chooseDir">选择目录</el-button>
    </template>
    <el-input v-else v-model="model" type="text" autocomplete="off" />
  </SettingField>
</template>

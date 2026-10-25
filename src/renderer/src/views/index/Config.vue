<script setup lang="ts">
import { STORE_SCOPES } from "@shared/defines"
import type { StoreScope } from "@shared/defines"
import { flushBridge } from "@/composables/useBridge"
import { imScope, imStore } from "@/stores"
import { CONFIG_PANELS } from "@/views/index/schema"
/** 刷新存储 */
async function reloadStore(name?: StoreScope) {
  if (name != undefined) {
    imScope[name]().reset()
  } else {
    // 全量回填出厂值
    STORE_SCOPES.forEach(function (scope) {
      imScope[scope]().reset()
    })
  }
  // 先落盘再刷新，避免防抖窗口内的重置被丢弃
  await flushBridge()
  window.location.reload()
}
</script>

<template>
  <AppLayout>
    <el-form label-position="top">
      <el-tabs v-model="imStore.app.panel_index" type="border-card">
        <el-tab-pane v-for="(panel, index) in CONFIG_PANELS" :key="panel.scope" :label="panel.label" :name="String(index)">
          <template v-for="(group, groupIndex) in panel.groups" :key="groupIndex">
            <el-divider v-if="group.title" content-position="left">{{ group.title }}</el-divider>
            <el-row v-for="(row, rowIndex) in group.rows" :key="rowIndex">
              <el-col v-for="(field, fieldIndex) in row" :key="fieldIndex" :span="field.span ?? 24" :class="{ 'col-gap': field.gap }">
                <SettingRow :field="field" :data="imStore[panel.scope]" />
              </el-col>
            </el-row>
          </template>
          <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="重置为默认值?" @confirm="reloadStore(panel.scope)">
            <template #reference>
              <el-button>重置选项</el-button>
            </template>
          </el-popconfirm>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <AppFooter>
      <ActionBar>
        <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="重置为默认值?" @confirm="reloadStore()">
          <template #reference>
            <el-button>全部重置</el-button>
          </template>
        </el-popconfirm>
      </ActionBar>
    </AppFooter>
  </AppLayout>
</template>

<style lang="scss" scoped>
.col-gap {
  padding-left: var(--fx-space-md);
}
</style>

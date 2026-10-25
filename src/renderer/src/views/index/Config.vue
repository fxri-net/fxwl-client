<script setup lang="ts">
import { onMounted, ref } from "vue"
import { STORE_SCOPES } from "@shared/defines"
import type { StoreScope } from "@shared/defines"
import { flushBridge } from "@/composables/useBridge"
import { imScope, imStore } from "@/stores"
import { CONFIG_PANELS } from "@/views/index/schema"
/** 应用版本号 */
const version = ref("")
onMounted(function () {
  // 纯浏览器环境没有原生通道
  if (window.doNative == undefined) return
  window.doNative.app.version().then(function (res) {
    version.value = "v" + res
  })
})
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
      <div class="panel-tabs">
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
        <span class="tabs-version">{{ version }}</span>
      </div>
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
.panel-tabs {
  position: relative;
}

/* 页签导航右侧留出与版本号等宽的空隙，避免页签变多时重叠 */
.panel-tabs :deep(.el-tabs__nav-wrap) {
  padding-right: 72px;
}

/* 版本号压在页签栏右端，不参与布局也不拦截点击 */
.tabs-version {
  position: absolute;
  top: 0;
  right: var(--fx-space-md);
  display: flex;
  align-items: center;
  height: var(--el-tabs-header-height, 40px);
  color: var(--fx-color-text-secondary);
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
}

.col-gap {
  padding-left: var(--fx-space-md);
}
</style>

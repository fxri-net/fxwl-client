<script setup lang="ts">
import { ref } from "vue"
import { doView } from "@/libs/nav"
/** 页面列表 */
const list = ref([
  { title: "配置项", url: "/config" },
  { title: "客户端", url: "/client/index" }
])
</script>

<template>
  <AppLayout>
    <el-row class="fx-grid" :gutter="20">
      <el-col v-for="(item, index) in list" :key="index" :xs="24" :sm="12" :md="6">
        <el-card class="box-card">
          <template #header>
            <div class="title">
              <span>{{ item.title }}</span>
              <el-button type="success" plain @click="doView.jump(item.url)">跳转页面</el-button>
            </div>
          </template>
          <div>
            <span>{{ item.url }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <AppFooter>
      <ActionBar />
    </AppFooter>
  </AppLayout>
</template>

<style lang="scss" scoped>
/* 首页栅格自带内边距，外壳内边距需与其对齐 */
:deep(.fx-panel) {
  padding: var(--fx-space-md) var(--fx-space-sm) var(--fx-footer-height) var(--fx-space-sm) !important;
}

.fx-grid {
  margin: 0 !important;
}

.fx-grid .el-col {
  padding: 0 var(--fx-space-sm) !important;
  margin-bottom: var(--fx-space-md);
  border-radius: var(--fx-radius-sm);
}

.fx-grid .title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

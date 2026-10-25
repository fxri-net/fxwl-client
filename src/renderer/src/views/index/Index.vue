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
    <el-row class="fxy-grid" :gutter="20">
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
/* 首页栅格自带 5px 内边距，外壳内边距需与其对齐 */
:deep(.fxy-panel) {
  padding: 10px 5px 52px 5px !important;
}

.fxy-grid {
  margin: 0 !important;
}

.fxy-grid .el-col {
  padding: 0 5px !important;
  margin-bottom: 10px;
  border-radius: 4px;
}

.fxy-grid .title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

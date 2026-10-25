<script setup lang="ts">
import { ref } from "vue"
import { imApp, imView } from "@/libs/base"
import { doView } from "@/libs/nav"
// 初始化变量
const list = ref([
  { title: "配置项", url: "/config" },
  { title: "客户端", url: "/client/index" }
])
/** 清理缓存 */
function cleanCache() {
  // 清空参数
  imApp.param.value = {}
  imView.deploy.value = {}
  // 刷新页面
  reloadPage()
}
/** 刷新页面 */
function reloadPage() {
  window.location.reload()
}
/** 重启应用 */
function restartApp() {
  doNative.app.restart()
}
/** 退出应用 */
function exitApp() {
  doNative.app.quit()
}
</script>

<template>
  <div class="fxy-layout">
    <el-row class="fxy-panel" :gutter="20">
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
    <el-row class="fxy-footer">
      <el-col :span="16">
        <el-button type="success" @click="reloadPage">刷新页面</el-button>
        <el-button @click="cleanCache">清理缓存</el-button>
        <el-button @click="doView.jump('/')">返回首页</el-button>
      </el-col>
      <el-col :span="8" class="op-right">
        <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="重启应用程序?" @confirm="restartApp">
          <template #reference>
            <el-button type="warning">重启应用</el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="关闭应用程序?" @confirm="exitApp">
          <template #reference>
            <el-button type="danger">退出应用</el-button>
          </template>
        </el-popconfirm>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.fxy-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  padding: 10px 5px 52px 5px !important;
  margin: 0 !important;
}

.fxy-panel:last-child {
  margin-bottom: 0;
}

.fxy-panel .el-col {
  padding: 0 5px !important;
  margin-bottom: 10px;
  border-radius: 4px;
}

.fxy-panel .grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.fxy-panel .title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fxy-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px;
  background: #fff;
}

.fxy-footer .op-right {
  text-align: right;
}
</style>

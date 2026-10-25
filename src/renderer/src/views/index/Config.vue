<script setup lang="ts">
import { STORE_SCOPES } from "@shared/defines"
import type { StoreScope } from "@shared/defines"
import { flushBridge } from "@/composables/useBridge"
import { isBlank } from "@/libs/is"
import { imScope, imStore } from "@/stores"
import { useAppStore } from "@/stores/app"
/** 应用存储 */
const appStore = useAppStore()
/** 配置索引 */
function tabChange(name: any) {
  imStore.app.panel_index = name
}
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
/** 选择目录 */
async function chooseDir() {
  /** 选中的目录，取消时为 null */
  const dir = await doNative.dialog.openDirectory("选择目录")
  if (dir == null || isBlank(dir)) return
  imStore.panel.server.dir = dir
}
</script>

<template>
  <AppLayout>
    <el-form class="fxy-form" label-position="top">
      <el-tabs v-model="imStore.app.panel_index" type="border-card" @tab-change="tabChange">
        <el-tab-pane label="应用">
          <el-divider content-position="left">环境配置</el-divider>
          <SettingField label="应用标题">
            <el-input v-model="imStore.app.title" type="text" autocomplete="off" />
          </SettingField>
          <SettingSwitch v-model="imStore.app.debug" label="调试模式" />
          <SettingField label="默认页面">
            <el-select v-model="imStore.app.url_default" class="m-2" placeholder="选择默认页面" size="large">
              <el-option v-for="(item, index) in appStore.enums.url_list" :key="index" :label="index" :value="item" />
            </el-select>
          </SettingField>
          <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="重置为默认值?" @confirm="reloadStore('app')">
            <template #reference>
              <el-button>重置选项</el-button>
            </template>
          </el-popconfirm>
        </el-tab-pane>
        <el-tab-pane label="面板">
          <el-divider content-position="left">窗口配置</el-divider>
          <el-row>
            <el-col :span="12">
              <SettingField label="宽度">
                <el-input v-model="imStore.panel.window.width" type="text" autocomplete="off" />
              </SettingField>
              <SettingField label="高度">
                <el-input v-model="imStore.panel.window.height" type="text" autocomplete="off" />
              </SettingField>
            </el-col>
            <el-col :span="12" class="col-right">
              <SettingField label="左边距">
                <el-input v-model="imStore.panel.window.x" type="text" autocomplete="off" />
              </SettingField>
              <SettingField label="上边距">
                <el-input v-model="imStore.panel.window.y" type="text" autocomplete="off" />
              </SettingField>
            </el-col>
            <el-col :span="4">
              <SettingSwitch v-model="imStore.panel.window.startup" label="开机自启" />
            </el-col>
            <el-col :span="4">
              <SettingSwitch v-model="imStore.panel.window.fullscreen" label="全屏" />
            </el-col>
            <el-col :span="4">
              <SettingSwitch v-model="imStore.panel.window.frame" label="无边框" />
            </el-col>
            <el-col :span="4">
              <SettingSwitch v-model="imStore.panel.window.isTop" label="置顶" />
            </el-col>
            <el-col :span="4">
              <SettingSwitch v-model="imStore.panel.window.isFocus" label="强制置顶" />
            </el-col>
            <el-col :span="4">
              <SettingSwitch v-model="imStore.panel.window.http_cache" label="HTTP缓存" />
            </el-col>
          </el-row>
          <el-divider content-position="left">网站配置</el-divider>
          <el-row>
            <el-col :span="12">
              <SettingSwitch v-model="imStore.panel.server.switch" label="开关" />
              <SettingField label="目录">
                <el-input v-model="imStore.panel.server.dir" type="text" autocomplete="off" style="width: calc(100% - 88px)" />
                <el-button type="warning" @click="chooseDir">选择目录</el-button>
              </SettingField>
            </el-col>
            <el-col :span="12" class="col-right">
              <SettingSwitch v-model="imStore.panel.server.port_prompt" label="端口占用提示" />
              <SettingField label="端口">
                <el-input v-model="imStore.panel.server.port" type="text" autocomplete="off" />
              </SettingField>
            </el-col>
          </el-row>
          <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="重置为默认值?" @confirm="reloadStore('panel')">
            <template #reference>
              <el-button>重置选项</el-button>
            </template>
          </el-popconfirm>
        </el-tab-pane>
        <el-tab-pane label="客户端">
          <el-divider content-position="left">环境配置</el-divider>
          <SettingField label="页面地址（HTTP）">
            <el-input v-model="imStore.client.url_host" type="text" autocomplete="off" />
          </SettingField>
          <SettingField label="返回按钮">
            <el-select v-model="imStore.client.back_btn" class="m-2" placeholder="选择按钮位置" size="large">
              <el-option v-for="(item, index) in appStore.enums.back_btns" :key="index" :label="index" :value="item" />
            </el-select>
          </SettingField>
          <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="重置为默认值?" @confirm="reloadStore('client')">
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
.el-tabs--border-card > .el-tabs__content {
  padding: 0 15px;
}

.fxy-form .col-right {
  padding-left: 10px;
}
</style>

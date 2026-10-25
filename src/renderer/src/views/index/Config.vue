<script setup lang="ts">
import { imApp, imStore, imView } from "@/libs/base"
import { doView } from "@/libs/module"
import store from "@/utils/store"
/** 配置索引 */
function tabChange(name: any) {
  imStore.app.panel_index = name
}
/** 刷新存储 */
function reloadStore(name?: typeof imStore.app.store_name) {
  if (name != undefined) {
    doData.merge("ref|mix", imStore[name], store[name].data)
    // 刷新页面
    reloadPage()
    return
  }
  // 重置数据
  $.each(imStore, function (key) {
    doData.merge("ref|mix", imStore[key], store[key].data)
  })
  // 刷新页面
  reloadPage()
}
/** 选择目录 */
async function chooseDir() {
  /** 选中的目录，取消时为 null */
  const dir = await doNative.dialog.openDirectory("选择目录")
  if (dir == null || isBlank(dir)) return
  imStore.panel.server.dir = dir
}
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
    <el-form class="fxy-panel" label-position="top">
      <el-tabs v-model="imStore.app.panel_index" type="border-card" @tab-change="tabChange">
        <el-tab-pane label="应用">
          <el-divider content-position="left">环境配置</el-divider>
          <el-form-item label="应用标题">
            <el-input v-model="imStore.app.title" type="text" autocomplete="off" />
          </el-form-item>
          <el-form-item label="调试模式">
            <el-switch v-model="imStore.app.debug" size="large" inline-prompt style="--el-switch-on-color: #13ce66" active-text="开启" inactive-text="关闭" />
          </el-form-item>
          <el-form-item label="默认页面">
            <el-select v-model="imStore.app.url_default" class="m-2" placeholder="选择默认页面" size="large">
              <el-option v-for="(item, index) in imStore.app.url_list" :key="index" :label="index" :value="item" />
            </el-select>
          </el-form-item>
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
              <el-form-item label="宽度">
                <el-input v-model="imStore.panel.window.width" type="text" autocomplete="off" />
              </el-form-item>
              <el-form-item label="高度">
                <el-input v-model="imStore.panel.window.height" type="text" autocomplete="off" />
              </el-form-item>
            </el-col>
            <el-col :span="12" class="col-right">
              <el-form-item label="左边距">
                <el-input v-model="imStore.panel.window.x" type="text" autocomplete="off" />
              </el-form-item>
              <el-form-item label="上边距">
                <el-input v-model="imStore.panel.window.y" type="text" autocomplete="off" />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="开机自启">
                <el-switch
                  v-model="imStore.panel.window.startup"
                  size="large"
                  inline-prompt
                  style="--el-switch-on-color: #13ce66"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="全屏">
                <el-switch
                  v-model="imStore.panel.window.fullscreen"
                  size="large"
                  inline-prompt
                  style="--el-switch-on-color: #13ce66"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="无边框">
                <el-switch
                  v-model="imStore.panel.window.frame"
                  size="large"
                  inline-prompt
                  style="--el-switch-on-color: #13ce66"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="置顶">
                <el-switch
                  v-model="imStore.panel.window.isTop"
                  size="large"
                  inline-prompt
                  style="--el-switch-on-color: #13ce66"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="强制置顶">
                <el-switch
                  v-model="imStore.panel.window.isFocus"
                  size="large"
                  inline-prompt
                  style="--el-switch-on-color: #13ce66"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="HTTP缓存">
                <el-switch
                  v-model="imStore.panel.window.http_cache"
                  size="large"
                  inline-prompt
                  style="--el-switch-on-color: #13ce66"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider content-position="left">网站配置</el-divider>
          <el-row>
            <el-col :span="12">
              <el-form-item label="开关">
                <el-switch
                  v-model="imStore.panel.server.switch"
                  size="large"
                  inline-prompt
                  style="--el-switch-on-color: #13ce66"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
              <el-form-item label="目录">
                <el-input v-model="imStore.panel.server.dir" type="text" autocomplete="off" style="width: calc(100% - 88px)" />
                <el-button type="warning" @click="chooseDir">选择目录</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="12" class="col-right">
              <el-form-item label="端口占用提示">
                <el-switch
                  v-model="imStore.panel.server.port_prompt"
                  size="large"
                  inline-prompt
                  style="--el-switch-on-color: #13ce66"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
              <el-form-item label="端口">
                <el-input v-model="imStore.panel.server.port" type="text" autocomplete="off" />
              </el-form-item>
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
          <el-form-item label="页面地址（HTTP）">
            <el-input v-model="imStore.client.url_host" type="text" autocomplete="off" />
          </el-form-item>
          <el-form-item label="返回按钮">
            <el-select v-model="imStore.client.back_btn" class="m-2" placeholder="选择按钮位置" size="large">
              <el-option v-for="(item, index) in imStore.app.back_btns" :key="index" :label="index" :value="item" />
            </el-select>
          </el-form-item>
          <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="重置为默认值?" @confirm="reloadStore('client')">
            <template #reference>
              <el-button>重置选项</el-button>
            </template>
          </el-popconfirm>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <el-row class="fxy-footer">
      <el-col :span="16">
        <el-button type="success" @click="reloadPage">刷新页面</el-button>
        <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="重置为默认值?" @confirm="reloadStore()">
          <template #reference>
            <el-button>全部重置</el-button>
          </template>
        </el-popconfirm>
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
.el-tabs--border-card > .el-tabs__content {
  padding: 0 15px;
}

.fxy-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  padding: 10px 10px 52px 10px;
}

.fxy-panel .col-right {
  padding-left: 10px;
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

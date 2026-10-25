# 配置说明

配置统一由主进程读写，渲染层只持有内存副本。本页逐项解释字段、默认值与生效方式，供手工排障与二次开发使用。

## 一、配置文件

| 项目 | 位置 |
| --- | --- |
| 配置文件 | `<用户数据目录>/config/config.json` |
| 默认站点目录 | `<用户数据目录>/website` |
| 迁移标记 | `<用户数据目录>/.migrated` |

配置按三个范围分文件存储，对应配置页的三个页签：

| 范围 | 页签 | 内容 |
| --- | --- | --- |
| `app` | 应用 | 标题、调试、默认页面、页面列表 |
| `panel` | 面板 | 窗口与静态服务 |
| `client` | 客户端 | 内嵌页地址与导航胶囊 |

::: tip 手工修改的注意事项
先退出应用再编辑配置文件。写入后再次启动，缺失字段会自动补默认值，越界数值会被收敛到允许区间，无法识别的选项会回退默认值——因此手工写错不会导致应用起不来。
:::

## 二、版本与迁移

配置带 `version` 字段，当前为 `1`。

`0 → 1` 迁移做三件事：

- 删除旧版的 `app.back_btns`（选项表由界面按锚点重新生成，不再持久化）。
- 把旧版 `client.back_btn` 的内联样式（形如 `left: 0; right: auto; top: 0; bottom: auto;`）换算为导航锚点。
- 已存在 `client.nav` 时保留原值，不覆盖。

迁移只向前逐级执行：读出 `version` 后按迁移表逐版本升级，最后统一归一化。迁移函数缺失时停止升级并直接归一化。

## 三、应用

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `app.title` | 字符串 | `方弦物联` | 窗口标题后缀，也用于端口占用提示的对话框标题 |
| `app.debug` | 布尔 | `false` | 预留调试开关，当前版本未参与运行时判断 |
| `app.store_name` | 枚举 | `app` | 存储范围标识，取值 `app` / `client` / `panel` |
| `app.url_default` | 字符串 | `/` | 启动后首个页面；必须命中 `url_list` 的值，否则回退列表首项 |
| `app.url_list` | 对象 | 见下 | 页面名到路由地址的映射，供「默认页面」下拉框使用 |
| `app.panel_index` | 字符串 | `0` | 配置页当前页签索引，逗留位置会被记住 |

`url_list` 默认值：

```json
{
  "首页": "/",
  "配置项": "/config",
  "客户端": "/client/index"
}
```

空名称或空地址的条目会被剔除；剔除后为空则回退默认列表。

## 四、面板

### 窗口配置

| 字段 | 类型 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- |
| `panel.window.width` | 数值 | `1280` | 320～7680 | 窗口宽度 |
| `panel.window.height` | 数值 | `720` | 240～4320 | 窗口高度 |
| `panel.window.x` | 数值或 `center` | `center` | 0～10000 | 左边距，`center` 交由系统居中 |
| `panel.window.y` | 数值或 `center` | `center` | 0～10000 | 上边距，`center` 交由系统居中 |
| `panel.window.fullscreen` | 布尔 | `false` | — | 全屏启动 |
| `panel.window.frame` | 布尔 | `false` | — | 无边框开关；为 `true` 时窗口不显示系统边框 |
| `panel.window.isTop` | 布尔 | `false` | — | 窗口置顶 |
| `panel.window.isFocus` | 布尔 | `false` | — | 强制置顶，周期性抢焦点 |
| `panel.window.startup` | 布尔 | `false` | — | 开机自启 |
| `panel.window.http_cache` | 布尔 | `true` | — | HTTP 缓存开关 |

::: warning frame 的语义
该字段表示「无边框」，与 Electron `BrowserWindow` 的 `frame` 参数语义相反：配置为 `true` 时传给窗口的是 `frame: false`。手工改配置时按「无边框」理解。
:::

关闭窗口时应用会把当前尺寸与位置回写到这四个字段（取常规状态下的边界），因此这些值会随使用自动变化。

### 网站配置

| 字段 | 类型 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- |
| `panel.server.switch` | 布尔 | `false` | — | 是否随应用启动本地静态服务 |
| `panel.server.dir` | 字符串 | `website` | — | 站点根目录，相对路径按用户数据目录解析 |
| `panel.server.port` | 数值 | `2602` | 1～65535 | 监听端口，被占用时向后避让，最多尝试 100 次 |
| `panel.server.port_prompt` | 布尔 | `false` | — | 端口发生避让时是否弹框提示 |

## 五、客户端

| 字段 | 类型 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- |
| `client.url_host` | 字符串 | `http://127.0.0.1:2602` | 必须为 `http` / `https` | 内嵌页地址，同时决定放行的主机名 |
| `client.nav.anchor` | 枚举 | `top-left` | `top-left` / `top-right` / `bottom-right` / `bottom-left` | 导航胶囊停靠位置 |
| `client.nav.offsetX` | 数值 | `0` | 0～400 | 水平偏移（像素），四舍五入取整 |
| `client.nav.offsetY` | 数值 | `0` | 0～400 | 垂直偏移（像素），四舍五入取整 |
| `client.nav.idleOpacity` | 数值 | `0.35` | 0.1～1 | 胶囊闲置后的不透明度，配置页未暴露 |

::: warning 主机名白名单
内嵌页放行按「配置地址的主机名」判定，`127.0.0.1` 与 `localhost` 属于不同主机名。页面地址填 `http://localhost:2602` 后，网页内跳转到 `http://127.0.0.1:2602` 会被拦截并转交系统浏览器。
:::

## 六、生效方式

| 生效时机 | 涉及字段 |
| --- | --- |
| 修改后立即响应界面 | `app.*`、`client.*`、`panel.server.*` |
| 开机自启即时注册或注销 | `panel.window.startup` |
| 下次启动应用 | `panel.window.width`、`height`、`x`、`y`、`fullscreen`、`frame`、`isTop`、`isFocus` |
| 重启应用后 | `panel.window.http_cache`（命令行开关须在应用就绪前设置） |
| 应用启动时读取一次 | `panel.server.switch`、`dir`、`port`、`port_prompt` |

界面内改动经约 0.5 秒防抖写入磁盘；重启类字段不需要额外保存动作，点「重启应用」即可让改动生效。

## 七、配置页暴露情况

配置页由 schema 驱动，只渲染已声明的字段。当前未在界面暴露、需要手工编辑的字段：

- `app.store_name`
- `app.url_list`
- `client.nav.idleOpacity`

新增或调整界面字段只需改配置 schema 中的一行声明，无需改动渲染逻辑，具体做法见[开发指南](./development#新增配置字段)。

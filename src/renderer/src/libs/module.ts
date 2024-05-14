// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { LocationQueryRaw } from "vue-router"
import { ElNotification, ElMessage } from "element-plus"
/**
 * 消息模块
 */
export const doInfo = {
  /**
   * 通知消息
   */
  notice: function (...args: any[]): void {
    setTimeout(() => {
      // 设置根元素
      args[0].appendTo = ".fxy-layout"
      // 弹出信息
      ElNotification(...args)
    }, 0)
  },
  /**
   * 消息提示
   */
  message: function (...args: any[]): void {
    setTimeout(() => {
      // 设置根元素
      args[0].appendTo = ".fxy-layout"
      // 弹出信息
      ElMessage(...args)
    }, 0)
  }
}
/**
 * 参数模块
 */
export const doParam = {
  /**
   * 定义变量
   */
  define: function (base: any, data: any, empty = false): any {
    // 定义变量
    $.each(data, function (key, value) {
      if (isObject(base[key]) && isObject(value) && !isEmpty(value)) {
        doParam.define(base[key], value, empty)
      } else if (isEmpty(base[key]) && (empty || isSet(value))) {
        base[key] = value
      }
    })
    return base
  },
  /**
   * 监听变量
   */
  watch: function (name: string, base?: any): void {
    // 疏理基础
    if (!isObject(base)) return
    // 疏理数据
    let data: any = localStorage.getItem(name)
    if (isJson(data)) {
      data = JSON.parse(data)
    }
    data = isObject(data) ? data : {}
    // 配置数据
    base[name] = toRef(data)
    // 监听数据
    watch(
      base[name],
      (data) =>
        localStorage.setItem(
          name,
          !isString(data) ? JSON.stringify(data) : String(data)
        ),
      { deep: true }
    )
  },
  /**
   * 处理枚举
   */
  enum: function (index: any, enums: any): void {
    // 处理枚举
    if (isString(enums)) {
      enums = JSON.parse(enums)
    }
    return isSet(enums[index]) ? enums[index] : ""
  }
}
/**
 * 视图模块
 */
export const doView = {
  /**
   * 计算缩放
   */
  scale: function (
    width: number,
    height: number,
    boxW = $("#app").width(),
    boxH = $("#app").height()
  ): string {
    // 定义宽高
    !boxW && (boxW = width)
    !boxH && (boxH = height)
    // 计算缩放
    return "transform: scale(" + boxW / width + ", " + boxH / height + ")"
  },
  /**
   * 跳转页面
   */
  jump: function (url: string, param?: LocationQueryRaw): void {
    // 检查url
    if (!isUrl(url)) {
      imView.router && imView.router.push({ path: url, query: param })
    } else {
      window.location.href = url
    }
  },
  /**
   * 处理URL
   */
  url: function (url: string): string {
    // 检查url
    if (!isUrl(url)) {
      url = imStore.client.url_host.value + url
    }
    return url
  }
}

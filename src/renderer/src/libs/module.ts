// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { LocationQueryRaw } from "vue-router"
import { ElNotification, ElMessage } from "element-plus"
/** 数据模块 */
export const doData = {
  /**
   * 克隆
   * @param data 数据
   * @param deep 是否深克隆，默认true
   * @return 克隆后的数据
   */
  clone: function (data: any, deep = true): any {
    // 初始化变量
    switch (Object.prototype.toString.call(data)) {
      // 默认
      default:
        break
      // 数组
      case "[object Array]":
        // 浅克隆
        data = [...data]
        if (!deep) break
        // 深克隆
        data = data.map((item: any) => doData.clone(item, deep))
        break
      // 对象
      case "[object Object]":
        // 浅克隆
        data = { ...data }
        if (!deep) break
        // 深克隆
        for (const key in data) {
          data[key] = doData.clone(data[key], deep)
        }
        break
    }
    return data
  },
  /**
   * 合并
   * @param option 选项，用【|】隔开；
   * 选项1-源数据模式：deep=深克隆，默认值、ref=引用；
   * 选项2-合并模式：cover=覆盖，默认值，仅保留第一个对象参数的属性、mix=融合，保留所有对象参数的属性；
   * @param ...args 参数列表
   * @return 对象参数
   */
  merge: function (option: any | object, ...args: any[]): object {
    // 疏理选项
    if (Object.prototype.toString.call(option) === "[object Object]") {
      args.unshift(option as object)
      option = ["deep", "cover"]
    }
    if (typeof option === "string") {
      option = option.split("|")
    }
    // 配置参数
    let keys: string[] = []
    let data: any
    // 匹配选项1
    switch (option[0]) {
      // 默认
      default:
      // 深克隆
      case "deep":
        data = doData.clone(args[0])
        break
      // 引用
      case "ref":
        data = args[0]
        break
    }
    // 批量处理
    for (let i = 1; i < args.length; i++) {
      // 匹配选项2
      switch (option[1]) {
        // 默认
        default:
        // 覆盖
        case "cover":
          keys = Object.keys(data)
          break
        // 融合
        case "mix":
          keys = Object.keys(args[i])
          break
      }
      // 合并参数
      data = keys.reduce((acc, cur) => {
        // 跳过未定义参数
        if ([undefined, null].includes(args[i]?.[cur])) {
          return acc
        }
        // 匹配参数类型
        switch (Object.prototype.toString.call(acc[cur])) {
          // 默认
          default:
            acc[cur] = args[i][cur]
            break
          // 字符串
          case "[object String]":
            acc[cur] = String(args[i][cur])
            break
          // 数字
          case "[object Number]":
            acc[cur] = Number(args[i][cur])
            break
          // 布尔
          case "[object Boolean]":
            if (typeof args[i][cur] === "string") {
              acc[cur] = args[i][cur].toLowerCase() == "true"
            } else {
              acc[cur] = Boolean(args[i][cur])
            }
            break
          // 数组
          case "[object Array]":
          // 对象
          case "[object Object]":
            // 检查是否json并解析
            if (isJson(args[i][cur])) args[i][cur] = JSON.parse(args[i][cur])
            // 判断类型是否一致
            if (Object.prototype.toString.call(acc[cur]) !== Object.prototype.toString.call(args[i][cur])) break
            // 克隆数据
            acc[cur] = doData.clone(args[i][cur])
            break
        }
        return acc
      }, data)
    }
    return data
  }
}
/** 消息模块 */
export const doInfo = {
  /** 通知消息 */
  notice: function (...args: any[]): void {
    setTimeout(() => {
      // 设置根元素
      args[0].appendTo = ".fxy-layout"
      // 弹出信息
      ElNotification(...args)
    }, 0)
  },
  /** 消息提示 */
  message: function (...args: any[]): void {
    setTimeout(() => {
      // 设置根元素
      args[0].appendTo = ".fxy-layout"
      // 弹出信息
      ElMessage(...args)
    }, 0)
  }
}
/** 参数模块 */
export const doParam = {
  /** 定义变量 */
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
  /** 监听变量 */
  watch: function (name: string, base?: any): void {
    // 疏理数据
    let data: any = localStorage.getItem(name)
    if (isJson(data)) {
      data = JSON.parse(data)
    }
    data = isObject(data) ? data : {}
    // 配置数据
    if (isRef(base)) {
      doData.merge("ref|mix", base.value as any, data)
    } else if (isReactive(base)) {
      doData.merge("ref|mix", base, data)
    } else {
      return
    }
    // 监听数据
    watch(base, (data) => localStorage.setItem(name, !isString(data) ? JSON.stringify(data) : String(data)), { deep: true })
  },
  /** 处理枚举 */
  enum: function (index: any, enums: any): void {
    // 处理枚举
    if (isString(enums)) {
      enums = JSON.parse(enums)
    }
    return isSet(enums[index]) ? enums[index] : ""
  }
}
/** 视图模块 */
export const doView = {
  /** 计算缩放 */
  scale: function (width: number, height: number, boxW = $("#app").width(), boxH = $("#app").height()): string {
    // 定义宽高
    !boxW && (boxW = width)
    !boxH && (boxH = height)
    // 计算缩放
    return "transform: scale(" + boxW / width + ", " + boxH / height + ")"
  },
  /** 跳转页面 */
  jump: function (url: string, param?: LocationQueryRaw): void {
    // 检查url
    if (!isUrl(url)) {
      imView.router && imView.router.push({ path: url, query: param })
    } else {
      window.location.href = url
    }
  },
  /** 处理URL */
  url: function (url: string): string {
    // 检查url
    if (!isUrl(url)) {
      url = imStore.client.url_host + url
    }
    return url
  }
}

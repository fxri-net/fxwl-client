// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import { ElMessage, ElNotification } from "element-plus"
import { isEmpty, isObject, isSet, isString } from "@/libs/is"
/** 消息模块 */
export const doInfo = {
  /** 消息提示 */
  message: function (...args: any[]): void {
    setTimeout(() => {
      // 设置根元素
      args[0].appendTo = ".fx-layout"
      // 弹出信息
      ElMessage(...args)
    }, 0)
  },
  /** 通知消息 */
  notice: function (...args: any[]): void {
    setTimeout(() => {
      // 设置根元素
      args[0].appendTo = ".fx-layout"
      // 弹出信息
      ElNotification(...args)
    }, 0)
  }
}
/** 参数模块 */
export const doParam = {
  /** 定义变量 */
  define: function (base: any, data: any, empty = false): any {
    // 定义变量
    Object.keys(data).forEach(function (key) {
      if (isObject(base[key]) && isObject(data[key]) && !isEmpty(data[key])) {
        doParam.define(base[key], data[key], empty)
      } else if (isEmpty(base[key]) && (empty || isSet(data[key]))) {
        base[key] = data[key]
      }
    })
    return base
  },
  /** 处理枚举 */
  enum: function (index: any, enums: any): string {
    // 处理枚举
    if (isString(enums)) {
      enums = JSON.parse(enums)
    }
    return isSet(enums[index]) ? enums[index] : ""
  }
}

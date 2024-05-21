// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
/** 校验Json */
export function isJson(data: any): boolean {
  // 初始化变量
  try {
    data = JSON.parse(data)
    return typeof data == "object" && data
  } catch (error) {
    // code
  }
  return false
}
/** 校验空值 */
export function isEmpty(data: any): boolean {
  // 初始化变量
  switch (Object.prototype.toString.call(data)) {
    case "[object Null]":
    case "[object Undefined]":
      // NULL-未定义
      return true
    case "[object Boolean]":
    case "[object Number]":
      // 布尔-数字
      return !data
    case "[object String]":
      // 字符串
      data = parseInt(data) + "" == data ? parseInt(data) : data
      if (typeof data === "number") {
        data = !data
      } else {
        data = !data.length
      }
      return data
    case "[object Array]":
      // 数组
      return !data.length
    case "[object Object]":
      // 对象
      return !Object.keys(data).length
  }
  return false
}
/** 校验UNDEFINED */
export function isUndefined(data: any): boolean {
  // 初始化变量
  return data === undefined
}
/** 校验NULL */
export function isNull(data: any): boolean {
  // 初始化变量
  return data === null
}
/** 校验变量 */
export function isSet(data: any): boolean {
  // 初始化变量
  return data !== null && data !== undefined
}
/** 校验空白 */
export function isBlank(data: any): boolean {
  // 初始化变量
  return !isSet(data) || data === ""
}
/** 校验数组 */
export function isArray(data: any): boolean {
  // 初始化变量
  return Array.isArray(data)
}
/** 校验对象 */
export function isObject(data: any): boolean {
  // 初始化变量
  return $.isPlainObject(data) || Object.prototype.toString.call(data) == "[object Arguments]"
}
/** 校验数组或对象 */
export function isAorO(data: any): boolean {
  // 初始化变量
  return isArray(data) || isObject(data)
}
/** 校验元素 */
export function isHtml(data: any): boolean {
  const elem = document.createElement("div")
  try {
    if (data instanceof $) return true
    elem.appendChild(data.cloneNode(true))
    return data.nodeType == 1
  } catch (error) {
    // code
  }
  return data == window || data == document
}
/** 校验方法 */
export function isFunction(data: any): boolean {
  // 初始化变量
  return typeof data === "function"
}
/** 校验字符串 */
export function isString(data: any): boolean {
  // 初始化变量
  return typeof data == "string"
}
/** 校验数字 */
export function isNumeric(data: any): boolean {
  // 初始化变量
  switch (typeof data) {
    case "string":
    // 字符串
    // falls through
    case "number":
      // 数值
      data = data.toString()
      return parseFloat(data) == data && !isNaN(data)
  }
  return false
}
/** 校验手机 */
export function isMobile(data: any): boolean {
  // 初始化变量
  const reg = /^1\d{10}$/
  return reg.test(data)
}
/** 校验邮箱 */
export function isEmail(data: any): boolean {
  // 初始化变量
  const reg = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
  return reg.test(data)
}
/** 校验金额 */
export function isMoney(data: any): boolean {
  // 初始化变量
  const reg = /^(([1-9]\d*)|\d)(\.\d{1,2})?$/
  return reg.test(data)
}
/** 校验URL */
export function isUrl(data: any): boolean {
  // 初始化变量
  return data.indexOf("http") === 0
}

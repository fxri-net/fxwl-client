// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import fs from "fs"
import path from "path"
import { doEnv } from "../env"
/** 迁移标记文件名：存在即表示已迁移过，避免每次启动重复复制 */
const MARK_NAME = ".migrated"
/** 待迁移条目：旧数据目录下的一级路径 */
const ENTRY_NAMES = ["config", "website"]
/** 目录是否可写 @param dir 目录路径 @return 是否可创建并写入 */
function canWrite(dir: string): boolean {
  try {
    fs.mkdirSync(dir, { recursive: true })
    fs.accessSync(dir, fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}
/** 复制目录内容，目标已存在的文件不覆盖 @param source 源路径 @param target 目标路径 */
function copyTree(source: string, target: string): void {
  // 目录逐层展开，文件按缺失复制
  if (fs.statSync(source).isDirectory()) {
    if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true })
    fs.readdirSync(source).forEach(function (name) {
      copyTree(path.join(source, name), path.join(target, name))
    })
    return
  }
  if (fs.existsSync(target)) return
  fs.copyFileSync(source, target)
}
/** 迁移服务 */
export const doMigrate = {
  /** 准备数据目录：旧目录内容迁到用户数据目录，迁移不可用时退回旧目录 @return 实际使用的数据目录 */
  prepare: function (): string {
    /** 目标目录 */
    const target = doEnv.localDir
    /** 历史目录 */
    const legacy = doEnv.legacyDir
    /** 迁移标记 */
    const mark = path.join(target, MARK_NAME)
    // 新旧目录重合或旧目录不存在时无需迁移
    if (legacy == target || !fs.existsSync(legacy)) return target
    // 已迁移过则直接使用目标目录
    if (fs.existsSync(mark)) return target
    try {
      if (!canWrite(target)) throw new Error("用户数据目录不可写")
      ENTRY_NAMES.forEach(function (name) {
        /** 旧目录中的条目 */
        const source = path.join(legacy, name)
        if (!fs.existsSync(source)) return
        copyTree(source, path.join(target, name))
      })
      // 全部复制完成才落标记，中途失败下次启动仍会重试
      fs.writeFileSync(mark, new Date().toISOString(), "utf8")
      return target
    } catch (error) {
      // 迁移失败不阻断启动，退回旧目录读写；旧目录保持原样，便于手工回退
      console.warn("[store] 数据目录迁移失败，回退使用旧目录：", legacy, error)
      return legacy
    }
  }
}

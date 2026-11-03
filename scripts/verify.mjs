// 聚合门禁：lint → typecheck → test → build → 文档链接与变更集一致性
// 本地与 CI 共用本脚本，不在 CI 配置里另写步骤枚举
import { execFileSync, spawnSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const isWindows = process.platform === "win32"
const flags = new Set(process.argv.slice(2))
const skipLinks = flags.has("--skip-links")
const skipChangeset = flags.has("--skip-changeset")
const errors = []

// 步骤清单：顺序有依赖，任一步失败即中止
const steps = [
  { label: "静态检查（lint）", args: ["run", "lint"] },
  { label: "类型检查（typecheck）", args: ["run", "typecheck"] },
  { label: "单元测试（test）", args: ["run", "test"] },
  { label: "更新日志镜像（CHANGELOG → docs）", command: process.execPath, args: ["scripts/check-changelog-doc.mjs"] },
  { label: "文档站主题一致（toolkit docs theme --check）", command: process.execPath, args: ["scripts/check-docs-theme.mjs"] },
  { label: "构建（build）", args: ["run", "build"] },
]

// git 只读调用：成功返回输出（可能为空串），失败返回 null
function git(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
  } catch {
    return null
  }
}

// 变更基准：显式 ref > GitHub 事件载荷 > GitLab MR diff 基准 > 目标分支 merge-base > 变更前提交 > 本地 HEAD~1
function resolveBaseline() {
  const explicit = process.env.CHANGESET_BASE_REF
  if (explicit) return git(["merge-base", explicit, "HEAD"]) ?? git(["rev-parse", explicit])
  const eventPath = process.env.GITHUB_EVENT_PATH
  if (eventPath && existsSync(eventPath)) {
    try {
      const event = JSON.parse(readFileSync(eventPath, "utf8"))
      const before = event?.before
      const sha = event?.pull_request?.base?.sha || (before && !/^0+$/.test(before) ? before : "")
      if (sha && git(["cat-file", "-e", `${sha}^{commit}`]) !== null) return sha
    } catch {
      // 事件载荷不可读时继续走其余基准
    }
  }
  const mrBase = process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA
  if (mrBase && git(["cat-file", "-e", `${mrBase}^{commit}`]) !== null) return mrBase
  const baseRef = process.env.GITHUB_BASE_REF || process.env.CI_MERGE_REQUEST_TARGET_BRANCH_NAME
  if (baseRef) {
    for (const ref of [`origin/${baseRef}`, baseRef]) {
      const merged = git(["merge-base", ref, "HEAD"])
      if (merged) return merged
    }
  }
  const before = process.env.CI_COMMIT_BEFORE_SHA
  if (before && !/^0+$/.test(before) && git(["cat-file", "-e", `${before}^{commit}`]) !== null) return before
  return git(["rev-parse", "HEAD~1"])
}

// 递归收集 docs 下的 Markdown
function collectMarkdown(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...collectMarkdown(full))
    else if (entry.name.endsWith(".md")) files.push(full)
  }
  return files
}

// 文档相对链接可达性：跳过外链、锚点与站点根路径；无扩展名时补 .md / index.md 再判
function checkDocLinks() {
  const docsRoot = join(root, "docs")
  if (!existsSync(docsRoot)) return
  for (const file of collectMarkdown(docsRoot)) {
    const content = readFileSync(file, "utf8")
    for (const matched of content.matchAll(/\]\(([^)]+)\)/g)) {
      const raw = (matched[1] ?? "").trim()
      if (!raw || raw.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith("/")) continue
      const target = raw.split("#")[0]
      if (!target) continue
      const base = resolve(dirname(file), target)
      const candidates = [base, `${base}.md`, join(base, "index.md")]
      if (!candidates.some((path) => existsSync(path))) errors.push(`${relative(root, file).split(sep).join("/")}: 链接目标不存在：${raw}`)
    }
  }
}

// 变更集一致性：触及 src/ 或手写 docs 的改动须新增变更集；docs/changelog.md 为生成物，不触发
function checkChangeset() {
  const baseline = resolveBaseline()
  if (!baseline) {
    console.log("变更集校验：跳过（无 git 基准）")
    return
  }
  const changed = (git(["diff", "--name-only", baseline]) ?? "")
    .split("\n")
    .filter(Boolean)
    .map((file) => file.split(sep).join("/"))
  const triggers = changed.some((file) => (file.startsWith("src/") || file.startsWith("docs/")) && file !== "docs/changelog.md")
  if (!triggers) return
  const baselineFiles = new Set(
    (git(["ls-tree", "--name-only", baseline, ".changeset/"]) ?? "")
      .split("\n")
      .filter(Boolean)
      .map((file) => file.split("/").pop()),
  )
  const current = existsSync(join(root, ".changeset"))
    ? readdirSync(join(root, ".changeset")).filter((name) => name.endsWith(".md") && name !== "README.md")
    : []
  // 发版提交会在同一次推送内消费掉变更集，净差异看不到它，故区间内新增过即算数
  const addedInRange = (git(["log", "--diff-filter=A", "--name-only", "--pretty=format:", `${baseline}..HEAD`, "--", ".changeset/"]) ?? "")
    .split("\n")
    .map((file) => file.trim())
    .filter((file) => file.endsWith(".md") && file.split("/").pop() !== "README.md")
  if (addedInRange.length === 0 && !current.some((name) => !baselineFiles.has(name))) {
    errors.push(".changeset: 本次改动触及 src/ 或 docs/，须新增变更集")
  }
}

const failedSteps = []
for (const step of steps) {
  console.log(`\n▶ ${step.label}`)
  const command = step.command ?? "npm"
  const result = spawnSync(command, step.args, { cwd: root, stdio: "inherit", shell: command === "npm" && isWindows })
  if (result.status !== 0) {
    failedSteps.push(step.label)
    break
  }
}

if (failedSteps.length === 0) {
  if (!skipLinks) checkDocLinks()
  if (!skipChangeset) checkChangeset()
}

if (failedSteps.length > 0 || errors.length > 0) {
  if (failedSteps.length > 0) {
    console.error(`\n✖ 门禁未通过：${failedSteps.join("、")}`)
  }
  if (errors.length > 0) {
    console.error(`\n✖ 一致性校验未通过：${errors.length} 项`)
    for (const error of errors) console.error(`  - ${error}`)
  }
  process.exit(1)
}

console.log(`\n✔ 门禁全部通过（共 ${steps.length} 步 + 一致性校验）`)

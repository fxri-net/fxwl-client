// +----------------------------------------------------------------------
// | Author 唐启云 <tqy@fxri.net>
// +----------------------------------------------------------------------
// | Category 方弦研究所
// +----------------------------------------------------------------------
import js from "@eslint/js"
import globals from "globals"
import pluginN from "eslint-plugin-n"
import pluginVue from "eslint-plugin-vue"
import tseslint from "typescript-eslint"
import prettier from "eslint-config-prettier"

/** 忽略清单 */
const ignores = [
  "node_modules/**",
  "dist/**",
  "out/**",
  // 内嵌站点的构建产物与本地运行目录不入库、不校验
  "website/**",
  "config/**",
  // unplugin 生成的声明文件不参与校验
  "src/renderer/src/auto-imports.d.ts",
  "src/renderer/src/components.d.ts"
]

/** 主进程运行时版本，与 Electron 22 内置的 Node 保持一致 */
const mainRuntime = "16.17.1"

export default tseslint.config(
  { ignores },
  // 基础规则
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginVue.configs["flat/recommended"],
  // 全项目通用规则
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      // 允许使用 @ts-ignore，但必须写原因
      "@typescript-eslint/ban-ts-comment": ["error", { "ts-ignore": "allow-with-description" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-function": ["error", { allow: ["arrowFunctions"] }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-var-requires": "off",
      // 项目沿用短路表达式与三元表达式作条件语句
      "@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true, allowTernary: true }],
      // 允许单单词组件名
      "vue/multi-word-component-names": "off",
      // 组件属性命名与顺序按项目既有写法
      "vue/prop-name-casing": "off",
      "vue/attribute-hyphenation": "off",
      "vue/require-default-prop": "off",
      "vue/v-on-event-hyphenation": "off",
      // v-html 由业务侧控制内容来源
      "vue/no-v-html": "off",
      "no-fallthrough": "off"
    }
  },
  // 组件脚本使用 TypeScript 解析
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    },
    rules: {
      // 类型检查已覆盖未定义标识符，auto-import 注入的全局对 ESLint 不可见
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn"
    }
  },
  // 工具链侧 CommonJS 脚本
  {
    files: ["**/*.{js,cjs,mjs}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  // 主进程与 preload 跑在 Electron 22 内置的 Node 16 上
  {
    files: ["src/main/**/*", "src/preload/**/*"],
    plugins: {
      n: pluginN
    },
    languageOptions: {
      globals: globals.node
    },
    settings: {
      n: {
        version: mainRuntime
      }
    },
    rules: {
      // 按运行时版本拦截语法与内置 API
      "n/no-unsupported-features/es-syntax": ["error", { version: mainRuntime }],
      "n/no-unsupported-features/es-builtins": ["error", { version: mainRuntime }],
      "n/no-unsupported-features/node-builtins": ["error", { version: mainRuntime }],
      // Node 17+ 才有的全局对象，主进程不可用
      "no-restricted-globals": [
        "error",
        { name: "structuredClone", message: "Electron 22 内置 Node 16 无 structuredClone，请改用 JSON 深拷贝" },
        { name: "fetch", message: "Electron 22 内置 Node 16 无全局 fetch，请改用主进程既有的 HTTP 能力" }
      ],
      // Node 18+ 才有的实例方法，主进程不可用
      "no-restricted-properties": [
        "error",
        { property: "at", message: "Node 16.17 运行时请改用下标访问" },
        { property: "findLast", message: "Node 16.17 运行时请改用倒序遍历" }
      ]
    }
  },
  // 渲染层跑在 Chromium 里
  {
    files: ["src/renderer/**/*"],
    languageOptions: {
      globals: globals.browser
    }
  },
  // 工具链脚本跑在本机 Node 20
  {
    files: ["*.{js,cjs,mjs,ts}", "build/**/*.{js,cjs,mjs}"],
    languageOptions: {
      globals: globals.node
    }
  },
  // 关闭与 prettier 冲突的格式规则，须置于最后
  prettier
)

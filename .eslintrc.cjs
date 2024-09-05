/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    "vue/setup-compiler-macros": true
  },
  extends: [
    "plugin:vue/vue3-recommended",
    // 优化组件属性排序规则
    "plugin:vue/vue3-recommended",
    "eslint:recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier"
  ],
  rules: {
    "@typescript-eslint/ban-ts-comment": ["error", { "ts-ignore": "allow-with-description" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": ["error", { allow: ["arrowFunctions"] }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-var-requires": "off",
    "prettier/prettier": 0,
    // 允许vue文件单个单词命名
    "vue/multi-word-component-names": "off",
    // 骆驼式变量名校验
    camelcase: "off",
    "@typescript-eslint/camelcase": "off",
    "vue/prop-name-casing": "off",
    // 属性连字符校验
    "vue/attribute-hyphenation": "off",
    // 属性默认值校验
    "vue/require-default-prop": "off",
    // on事件连字符校验
    "vue/v-on-event-hyphenation": "off",
    // html字段XSS风险校验
    "vue/no-v-html": "off",
    // 不允许 case 语句的失败
    "no-fallthrough": 0
  },
  overrides: [
    {
      files: ["*.js"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off"
      }
    }
  ]
}

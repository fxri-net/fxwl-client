const { notarize } = require("@electron/notarize")

/** 应用标识，与 electron-builder.yml 的 appId 保持一致 */
const appId = "net.fxri.fxwl-client"

module.exports = async (context) => {
  if (process.platform !== "darwin") return

  // 本机打包不做公证，只有 CI 上具备凭据时才需要
  if (!process.env.CI) {
    console.log("跳过公证：当前不在 CI 环境。")
    return
  }

  // 凭据缺失时跳过，避免打包流程整体失败
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASS) {
    console.warn("跳过公证：未配置 APPLE_ID 与 APPLE_ID_PASS。")
    return
  }

  const appName = context.packager.appInfo.productFilename

  try {
    await notarize({
      appBundleId: appId,
      appPath: `${context.appOutDir}/${appName}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASS
    })
    console.log(`公证完成：${appId}。`)
  } catch (error) {
    // 公证失败不阻断构建，产物仍可人工验证
    console.error(error)
  }
}

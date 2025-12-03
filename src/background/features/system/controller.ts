import { MESSAGE } from '@/background/constants/message'
import { registerHandler } from '@/background/core/message-router'
import { getSettings, openOptionsPage } from './service'

/**
 * 注册系统相关的消息处理器
 */
export function registerSystemController() {
  // 打开选项页面
  registerHandler(MESSAGE.OPEN_OPTIONS_PAGE, async _payload => {
    await openOptionsPage()
  })

  // 获取设置
  registerHandler(MESSAGE.GET_SETTINGS, async _payload => {
    return getSettings()
  })
}

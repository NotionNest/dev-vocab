import { registerMessageRouter } from './core/message-router'
import { registerWordController } from './features/words/controller'
import { registerSystemController } from './features/system/controller'
import { registerSystemEvents } from './core/system-events.ts'

registerMessageRouter()

registerWordController()
registerSystemController()

registerSystemEvents()

/**
 * 处理 @crxjs/vite-plugin 的 HMR 连接
 */
chrome.runtime.onConnect.addListener(port => {
  console.log('Port connected:', port.name)

  // 处理 @crxjs/vite-plugin 的 HMR 连接
  if (port.name === '@crx/client') {
    // 保持连接活跃，处理消息
    port.onMessage.addListener(message => {
      // 可以在这里处理 HMR 消息
      if (message.type === 'connected') {
        // console.log('[HMR] Client connected')
      }
    })

    port.onDisconnect.addListener(() => {
      // console.log('[HMR] Client disconnected')
    })
  }
})

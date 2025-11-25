import { TranslationService, BUILT_IN_SERVICES } from './translate'

export const DEFAULT_SYNC_CONFIG = {
  flotingBtn: true,
}
export const DEFAULT_LOCAL_STATE = {
  installDate: '',
  version: '',
  lastUpdatedAt: '',
}

export type SyncConfig = typeof DEFAULT_SYNC_CONFIG
export type LocalState = typeof DEFAULT_LOCAL_STATE

// ==================== 翻译服务配置 ====================

/**
 * 初始化默认翻译服务列表
 */
export const getDefaultTranslationServices = (): TranslationService[] => {
  return BUILT_IN_SERVICES.map(service => ({
    ...service,
    configured: false, // 初始都未配置
  }))
}

/**
 * 翻译服务配置存储键
 */
export const TRANSLATION_SERVICES_KEY = 'translationServices'

export const getSyncConfig = (): Promise<SyncConfig> =>
  new Promise(resolve => {
    chrome.storage.sync.get(DEFAULT_SYNC_CONFIG, (config: unknown) => {
      resolve((config as SyncConfig) ?? DEFAULT_SYNC_CONFIG)
    })
  })

export const setSyncConfig = (config: Partial<SyncConfig>) =>
  new Promise<void>(resolve => {
    chrome.storage.sync.set(config, () => resolve())
  })

export const getLocalState = (): Promise<LocalState> =>
  new Promise(resolve => {
    chrome.storage.local.get(DEFAULT_LOCAL_STATE, (state: unknown) => {
      resolve((state as LocalState) ?? DEFAULT_LOCAL_STATE)
    })
  })

export const updateLocalState = (state: Partial<LocalState>) =>
  new Promise<void>(resolve => {
    chrome.storage.local.set(state, () => resolve())
  })

// ==================== 翻译服务存储方法 ====================

/**
 * 获取所有翻译服务配置
 */
export const getTranslationServices = (): Promise<TranslationService[]> =>
  new Promise(resolve => {
    chrome.storage.local.get([TRANSLATION_SERVICES_KEY], (result) => {
      const services = result[TRANSLATION_SERVICES_KEY]
      if (services && Array.isArray(services)) {
        resolve(services as TranslationService[])
      } else {
        // 首次使用，返回默认配置
        const defaultServices = getDefaultTranslationServices()
        resolve(defaultServices)
      }
    })
  })

/**
 * 保存所有翻译服务配置
 */
export const setTranslationServices = (services: TranslationService[]): Promise<void> =>
  new Promise(resolve => {
    chrome.storage.local.set({ [TRANSLATION_SERVICES_KEY]: services }, () => resolve())
  })

/**
 * 更新单个翻译服务
 */
export const updateTranslationService = async (
  serviceId: string,
  updates: Partial<TranslationService>
): Promise<void> => {
  const services = await getTranslationServices()
  const index = services.findIndex(s => s.id === serviceId)
  if (index !== -1) {
    services[index] = { ...services[index], ...updates }
    await setTranslationServices(services)
  }
}

/**
 * 添加自定义翻译服务
 */
export const addCustomTranslationService = async (
  service: Omit<TranslationService, 'id' | 'isBuiltIn'>
): Promise<void> => {
  const services = await getTranslationServices()
  const newService: TranslationService = {
    ...service,
    id: `custom-${Date.now()}`,
    isBuiltIn: false,
  }
  services.push(newService)
  await setTranslationServices(services)
}

/**
 * 删除自定义翻译服务
 */
export const deleteTranslationService = async (serviceId: string): Promise<void> => {
  const services = await getTranslationServices()
  const service = services.find(s => s.id === serviceId)
  
  // 只能删除自定义服务
  if (service && !service.isBuiltIn) {
    const filtered = services.filter(s => s.id !== serviceId)
    await setTranslationServices(filtered)
  }
}

/**
 * 获取已启用的翻译服务（按优先级排序）
 */
export const getEnabledTranslationServices = async (): Promise<TranslationService[]> => {
  const services = await getTranslationServices()
  return services
    .filter(s => s.enabled && s.configured)
    .sort((a, b) => a.priority - b.priority)
}

/**
 * 重新排序翻译服务
 */
export const reorderTranslationServices = async (
  reorderedServices: TranslationService[]
): Promise<void> => {
  // 更新优先级
  const servicesWithNewPriority = reorderedServices.map((service, index) => ({
    ...service,
    priority: index + 1,
  }))
  await setTranslationServices(servicesWithNewPriority)
}

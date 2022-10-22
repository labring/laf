import { acceptHMRUpdate, defineStore } from 'pinia'
import { getApplicationByAppid } from '~/api/application'

export const useAppStore = defineStore('application', () => {
  let currentApp = $ref<{ appid: string; app_deploy_host: string; app_deploy_url_schema: string; created_by: string; oss_external_endpoint: string; spec: any }>()
  let roles = $ref<any>([])
  let permissions = $ref<any>([])
  let debugToken = $ref<any>(null)
  let fileToken = $ref<any>(null)
  let spec = $ref<any>({})
  let appDeployHost = $ref<any>(null)
  let appDeployUrlSchema = $ref<any>('http')
  let storageDeployHost = $ref<any>(null)
  let storageDeployUrlSchema = $ref<any>('http')
  let ossInternalEndpoint = $ref<any>(null)
  let ossExternalEndpoint = $ref<any>(null)

  const setCurrentApplication = async (appid: string) => {
    const res = await getApplicationByAppid(appid)

    currentApp = res.data?.application
    roles = res.data?.roles
    permissions = res.data?.permissions
    debugToken = res.data?.debug_token
    fileToken = res.data?.file_token
    spec = res.data?.spec
    appDeployHost = res.data?.app_deploy_host
    appDeployUrlSchema = res.data?.app_deploy_url_schema
    storageDeployHost = res.data?.storage_deploy_host
    storageDeployUrlSchema = res.data?.storage_deploy_url_schema
    ossInternalEndpoint = res.data?.oss_internal_endpoint
    ossExternalEndpoint = res.data?.oss_external_endpoint
  }

  return {
    currentApp: $$(currentApp),
    roles: $$(roles),
    permissions: $$(permissions),
    debugToken: $$(debugToken),
    fileToken: $$(fileToken),
    spec: $$(spec),
    appDeployHost: $$(appDeployHost),
    appDeployUrlSchema: $$(appDeployUrlSchema),
    storageDeployHost: $$(storageDeployHost),
    storageDeployUrlSchema: $$(storageDeployUrlSchema),
    ossInternalEndpoint: $$(ossInternalEndpoint),
    ossExternalEndpoint: $$(ossExternalEndpoint),
    setCurrentApplication,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))

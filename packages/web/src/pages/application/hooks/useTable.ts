import dayjs from 'dayjs'
import * as appAPI from '~/api/application'

export const useTable = () => {
  const createdApps = ref([])
  const joinedApps = ref([])
  const specs = ref([])
  const loading = ref(false)

  const getApplications = async (interval = false) => {
    if (!interval)
      loading.value = true

    const res = await appAPI.getMyApplications()

    loading.value = false
    if (res.error)
      return

    createdApps.value = res.data.created.map((app: any) => {
      app.created_at = dayjs(app.created_at).format('YYYY-MM-DD HH:mm')
      return app
    })
    joinedApps.value = res.data.joined.map((app: any) => {
      app.created_at = dayjs(app.created_at).format('YYYY-MM-DD HH:mm')
      return app
    })
  }

  const getSpecs = async () => {
    const res = await appAPI.getSpecs()
    if (res.error)
      return

    specs.value = res.data
  }

  return {
    createdApps,
    joinedApps,
    specs,
    loading,
    getApplications,
    getSpecs,
  }
}

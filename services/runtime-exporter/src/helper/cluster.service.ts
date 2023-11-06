import * as k8s from '@kubernetes/client-node'
import Config from '../config'
import {
  totalCPUForContainer,
  totalMemoryForContainer,
  quantityToScalar,
} from '@kubernetes/client-node/dist/util'

export interface Metric {
  cpu: number
  memory: number
  appid: string
  containerName: string
  podName: string
}

export class ClusterService {
  /**
   * Load kubeconfig:
   * - if kubeconfig is empty, load from default config (in-cluster service account or ~/.kube/config)
   * - if kubeconfig is not empty, load from string
   */
  static LABEL_KEY_APP_ID = 'laf.dev/appid'
  static NAMESPACE = Config.NAMESPACE

  static loadKubeConfig() {
    const conf = Config.KUBECONF
    const kc = new k8s.KubeConfig()

    // if conf is empty load from default config (in-cluster service account or ~/.kube/config)
    if (!conf) {
      kc.loadFromDefault()
      return kc
    }

    // if conf is not empty load from string
    kc.loadFromString(conf)
    return kc
  }

  static makeCoreV1Api() {
    const kc = this.loadKubeConfig()
    return kc.makeApiClient(k8s.CoreV1Api)
  }

  static getMetricsClient() {
    const kc = this.loadKubeConfig()
    return new k8s.Metrics(kc)
  }

  static async getRuntimePodMetricsForAllNamespaces(): Promise<Metric[]> {
    const metricsClient = this.getMetricsClient()
    let res: any
    console.log(ClusterService.NAMESPACE)
    if (ClusterService.NAMESPACE) {
      console.log(`sss${ClusterService.NAMESPACE}`)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res = await metricsClient.metricsApiRequest(
        `/apis/metrics.k8s.io/v1beta1/namespace/${ClusterService.NAMESPACE}/pods?labelSelector=laf.dev/appid`,
      )
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res = await metricsClient.metricsApiRequest(
        '/apis/metrics.k8s.io/v1beta1/pods?labelSelector=laf.dev/appid',
      )
    }

    const metricsList: Metric[] = []
    for (const item of res.items) {
      const appid = item.metadata.labels[ClusterService.LABEL_KEY_APP_ID]
      const podName = item.metadata.name
      for (const container of item.containers) {
        const containerName = container.name
        const cpu = Number(quantityToScalar(container.usage.cpu || 0))
        const memory = Number(quantityToScalar(container.usage.memory || 0))

        const metric: Metric = {
          cpu: cpu,
          memory: memory,
          appid: appid,
          containerName: containerName,
          podName: podName,
        }
        metricsList.push(metric)
      }
    }

    return metricsList
  }

  static async getRuntimePodsLimitForAllNamespaces(): Promise<Metric[]> {
    const coreV1Api = this.makeCoreV1Api()
    let res: any
    if (ClusterService.NAMESPACE) {
      res = await coreV1Api.listNamespacedPod(
        ClusterService.NAMESPACE,
        undefined,
        undefined,
        undefined,
        undefined,
        ClusterService.LABEL_KEY_APP_ID,
      )
    } else {
      res = await coreV1Api.listPodForAllNamespaces(
        undefined,
        undefined,
        undefined,
        ClusterService.LABEL_KEY_APP_ID,
      )
    }

    const metricsList: Metric[] = []

    for (const item of res.body.items) {
      const appid = item.metadata.labels[ClusterService.LABEL_KEY_APP_ID]
      const podName = item.metadata.name

      for (const container of item.spec.containers) {
        const containerName = container.name
        // cpu is in cores, convert to millicores, 1 core = 1000 millicores
        const cpu = Number(totalCPUForContainer(container).limit || 0) * 1000
        const memory =
          // memory is in bytes, convert to MB, 1024 * 1024 = 1048576
          Number(totalMemoryForContainer(container).limit || 0) / 1048576

        const metric: Metric = {
          cpu: cpu,
          memory: memory,
          appid: appid,
          containerName: containerName,
          podName: podName,
        }
        metricsList.push(metric)
      }
    }

    return metricsList
  }
}

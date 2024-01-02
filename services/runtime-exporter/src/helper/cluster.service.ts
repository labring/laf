import * as k8s from '@kubernetes/client-node'
import * as http from 'http'
import Config from '../config'
import {
  totalCPUForContainer,
  totalMemoryForContainer,
  quantityToScalar,
} from '@kubernetes/client-node/dist/util'
import { V1DeploymentList } from '@kubernetes/client-node'

export interface Metric {
  cpu: number
  memory: number
  appid: string
  containerName: string
  podName?: string
}

export class ClusterService {
  /**
   * Load kubeconfig:
   * - if kubeconfig is empty, load from default config (in-cluster service account or ~/.kube/config)
   * - if kubeconfig is not empty, load from string
   */
  static LABEL_KEY_APP_ID = 'laf.dev/appid'
  static LABEL_DATABASE = 'app.kubernetes.io/managed-by=kubeblocks'
  static NAMESPACE = Config.NAMESPACE
  static DB_NAMESPACE = Config.DB_NAMESPACE

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

  static makeAppsV1Api() {
    const kc = this.loadKubeConfig()
    return kc.makeApiClient(k8s.AppsV1Api)
  }

  static getMetricsClient() {
    const kc = this.loadKubeConfig()
    return new k8s.Metrics(kc)
  }

  static async getPodMetrics(
    namespace: string,
    label: string,
    app: string,
  ): Promise<Metric[]> {
    const metricsClient = this.getMetricsClient()
    let res: any
    if (namespace) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res = await metricsClient.metricsApiRequest(
        `/apis/metrics.k8s.io/v1beta1/namespaces/${namespace}/pods?labelSelector=${label}`,
      )
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res = await metricsClient.metricsApiRequest(
        `/apis/metrics.k8s.io/v1beta1/pods?labelSelector=${label}`,
      )
    }

    const metricsList: Metric[] = []

    if (app === 'RUNTIME') {
      for (const item of res.items) {
        const appid: string =
          item.metadata.labels[ClusterService.LABEL_KEY_APP_ID]
        const podName = item.metadata.name
        for (const container of item.containers) {
          // millicores
          const cpu = Number(quantityToScalar(container.usage.cpu || 0))
          // bytes
          const memory = Number(quantityToScalar(container.usage.memory || 0))

          const metric: Metric = {
            cpu: cpu,
            memory: memory,
            appid: appid,
            containerName: container.name,
            podName: podName,
          }
          metricsList.push(metric)
        }
      }
    } else {
      for (const item of res.items) {
        const appid: string = item.metadata.labels['app.kubernetes.io/instance']
        const podName = item.metadata.name
        for (const container of item.containers) {
          if (container.name === 'mongodb') {
            // millicores
            const cpu = Number(quantityToScalar(container.usage.cpu || 0))
            // bytes
            const memory = Number(quantityToScalar(container.usage.memory || 0))

            const metric: Metric = {
              cpu: cpu,
              memory: memory,
              appid: appid,
              containerName: container.name,
              podName: podName,
            }
            metricsList.push(metric)
          }
        }
      }
    }

    return metricsList
  }

  static async getRuntimePodsLimitForAllNamespaces(): Promise<Metric[]> {
    const appsV1Api = this.makeAppsV1Api()
    let res: {
      response: http.IncomingMessage
      body: V1DeploymentList
    }
    if (ClusterService.NAMESPACE) {
      res = await appsV1Api.listNamespacedDeployment(
        ClusterService.NAMESPACE,
        undefined,
        undefined,
        undefined,
        undefined,
        ClusterService.LABEL_KEY_APP_ID,
      )
    } else {
      res = await appsV1Api.listDeploymentForAllNamespaces(
        undefined,
        undefined,
        undefined,
        ClusterService.LABEL_KEY_APP_ID,
      )
    }

    const metricsList: Metric[] = []

    for (const item of res.body.items) {
      const appid = item.metadata.labels[ClusterService.LABEL_KEY_APP_ID]
      const hpa = Number(item.spec.replicas)
      for (const container of item.spec.template.spec.containers) {
        const containerName = container.name
        // cpu is in cores, convert to millicores, 1 core = 1000 millicores
        const cpu = Number(totalCPUForContainer(container).limit || 0) * 1000
        const memory =
          // memory is in bytes, convert to MB, 1024 * 1024 = 1048576
          Number(totalMemoryForContainer(container).limit || 0) / 1048576

        const metric: Metric = {
          cpu: cpu * hpa,
          memory: memory * hpa,
          appid: appid,
          containerName: containerName,
        }
        metricsList.push(metric)
      }
    }

    return metricsList
  }
}

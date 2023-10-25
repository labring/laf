import * as k8s from '@kubernetes/client-node'
import Config from '../config'
import { PodStatus } from '@kubernetes/client-node/dist/top'

export class ClusterService {
  /**
   * Load kubeconfig:
   * - if kubeconfig is empty, load from default config (in-cluster service account or ~/.kube/config)
   * - if kubeconfig is not empty, load from string
   */
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

  static async getPodForAllNameSpaces(): Promise<PodStatus[]> {
    const coreV1Api = this.makeCoreV1Api()
    const metricsClient = this.getMetricsClient()
    const pods = await k8s.topPods(coreV1Api, metricsClient)
    return pods
  }
}

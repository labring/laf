import { Injectable, Logger } from '@nestjs/common'
import { KubernetesObject, V1Ingress } from '@kubernetes/client-node'
import * as k8s from '@kubernetes/client-node'
import { GetApplicationNamespace } from 'src/utils/getter'
import { compare } from 'fast-json-patch'
import { GroupVersionKind } from 'src/region/cluster/types'
import {
  LABEL_KEY_APP_ID,
  LABEL_KEY_NAMESPACE_TYPE,
  LABEL_KEY_USER_ID,
} from 'src/constants'
import { ApplicationNamespaceMode, Region } from '../entities/region'

@Injectable()
export class ClusterService {
  private readonly logger = new Logger(ClusterService.name)

  /**
   * Load kubeconfig of region:
   * - if region kubeconfig is empty, load from default config (in-cluster service account or ~/.kube/config)
   * - if region kubeconfig is not empty, load from string
   */
  loadKubeConfig(region: Region) {
    const conf = region.clusterConf.kubeconfig
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

  // create app namespace
  async createAppNamespace(region: Region, appid: string, userid: string) {
    try {
      const namespace = new k8s.V1Namespace()
      namespace.metadata = new k8s.V1ObjectMeta()
      namespace.metadata.name = GetApplicationNamespace(region, appid)
      namespace.metadata.labels = {
        [LABEL_KEY_APP_ID]: appid,
        [LABEL_KEY_NAMESPACE_TYPE]: 'app',
        [LABEL_KEY_USER_ID]: userid,
      }
      const coreV1Api = this.makeCoreV1Api(region)

      const res = await coreV1Api.createNamespace(namespace)
      return res.body
    } catch (err) {
      this.logger.error(err)
      this.logger.error(err?.response?.body)
      throw err
    }
  }

  // get app namespace
  async getAppNamespace(region: Region, appid: string) {
    try {
      const coreV1Api = this.makeCoreV1Api(region)
      const namespace = GetApplicationNamespace(region, appid)
      const res = await coreV1Api.readNamespace(namespace)
      return res.body
    } catch (err) {
      if (err?.response?.body?.reason === 'NotFound') return null
      this.logger.error(err)
      this.logger.error(err?.response?.body)
      throw err
    }
  }

  // remove app namespace
  async removeAppNamespace(region: Region, appid: string) {
    if (region.namespaceConf?.mode !== ApplicationNamespaceMode.AppId) return

    try {
      const coreV1Api = this.makeCoreV1Api(region)
      const namespace = GetApplicationNamespace(region, appid)
      const res = await coreV1Api.deleteNamespace(namespace)
      return res
    } catch (err) {
      this.logger.error(err)
      this.logger.error(err?.response?.body)
      throw err
    }
  }

  async applyYamlString(region: Region, specString: string) {
    const api = this.makeObjectApi(region)
    const specs: KubernetesObject[] = k8s.loadAllYaml(specString)
    const validSpecs = specs.filter((s) => s && s.kind && s.metadata)
    const created: k8s.KubernetesObject[] = []

    for (const spec of validSpecs) {
      spec.metadata = spec.metadata || {}
      spec.metadata.annotations = spec.metadata.annotations || {}
      delete spec.metadata.annotations[
        'kubectl.kubernetes.io/last-applied-configuration'
      ]
      spec.metadata.annotations[
        'kubectl.kubernetes.io/last-applied-configuration'
      ] = JSON.stringify(spec)

      try {
        // try to get the resource, if it does not exist an error will be thrown and we will end up in the catch
        // block.
        await api.read(spec as any)
        // we got the resource, so it exists, so patch it
        //
        // Note that this could fail if the spec refers to a custom resource. For custom resources you may need
        // to specify a different patch merge strategy in the content-type header.
        //
        // See: https://github.com/kubernetes/kubernetes/issues/97423
        const response = await api.patch(
          spec,
          undefined,
          undefined,
          undefined,
          undefined,
          {
            headers: {
              'Content-Type': k8s.PatchUtils.PATCH_FORMAT_JSON_MERGE_PATCH,
            },
          },
        )
        created.push(response.body)
      } catch (e) {
        // not exist, create
        const response = await api.create(spec)
        created.push(response.body)
      }
    }
    return created
  }

  async deleteYamlString(region: Region, specString: string) {
    const api = this.makeObjectApi(region)
    const specs: k8s.KubernetesObject[] = k8s.loadAllYaml(specString)
    const validSpecs = specs.filter((s) => s && s.kind && s.metadata)
    const deleted: k8s.KubernetesObject[] = []

    for (const spec of validSpecs) {
      try {
        // try to get the resource, if it does not exist an error will be thrown and we will end up in the catch
        // block.
        await api.read(spec as any)
        // we got the resource, so it exists, so delete it
        const response = await api.delete(spec)
        deleted.push(response.body)
      } catch (e) {
        // not exist
      }
    }
    return deleted
  }

  async patchCustomObject(region: Region, spec: KubernetesObject) {
    const client = this.makeCustomObjectApi(region)
    const gvk = GroupVersionKind.fromKubernetesObject(spec)

    // get the current spec
    const res = await client.getNamespacedCustomObject(
      gvk.group,
      gvk.version,
      spec.metadata.namespace,
      gvk.plural,
      spec.metadata.name,
    )
    const currentSpec = res.body as KubernetesObject

    // calculate the patch
    const patch = compare(currentSpec, spec)
    const options = {
      headers: {
        'Content-Type': k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH,
      },
    }

    // apply the patch
    const response = await client.patchNamespacedCustomObject(
      gvk.group,
      gvk.version,
      spec.metadata.namespace,
      gvk.plural,
      spec.metadata.name,
      patch,
      undefined,
      undefined,
      undefined,
      options,
    )

    return response.body
  }

  async deleteCustomObject(region: Region, spec: KubernetesObject) {
    const client = this.makeCustomObjectApi(region)
    const gvk = GroupVersionKind.fromKubernetesObject(spec)

    const response = await client.deleteNamespacedCustomObject(
      gvk.group,
      gvk.version,
      spec.metadata.namespace,
      gvk.plural,
      spec.metadata.name,
    )

    return response.body
  }

  async getIngress(region: Region, name: string, namespace: string) {
    const api = this.makeNetworkingApi(region)

    try {
      const res = await api.readNamespacedIngress(name, namespace)
      return res.body
    } catch (err) {
      // if ingress not found, return null
      if (err?.response?.statusCode === 404) {
        return null
      }

      this.logger.error(err)
      this.logger.error(err?.response?.body)
      throw err
    }
  }

  async createIngress(region: Region, body: V1Ingress) {
    body.apiVersion = 'networking.k8s.io/v1'
    body.kind = 'Ingress'
    const api = this.makeNetworkingApi(region)
    const res = await api.createNamespacedIngress(body.metadata.namespace, body)
    return res.body
  }

  async deleteIngress(region: Region, name: string, namespace: string) {
    const api = this.makeNetworkingApi(region)
    const res = await api.deleteNamespacedIngress(name, namespace)
    return res.body
  }

  makeCoreV1Api(region: Region) {
    const kc = this.loadKubeConfig(region)
    return kc.makeApiClient(k8s.CoreV1Api)
  }

  makeAppsV1Api(region: Region) {
    const kc = this.loadKubeConfig(region)
    return kc.makeApiClient(k8s.AppsV1Api)
  }

  makeBatchV1Api(region: Region) {
    const kc = this.loadKubeConfig(region)
    return kc.makeApiClient(k8s.BatchV1Api)
  }

  makeObjectApi(region: Region) {
    const kc = this.loadKubeConfig(region)
    return kc.makeApiClient(k8s.KubernetesObjectApi)
  }

  makeCustomObjectApi(region: Region) {
    const kc = this.loadKubeConfig(region)
    return kc.makeApiClient(k8s.CustomObjectsApi)
  }

  makeHorizontalPodAutoscalingV2Api(region: Region) {
    const kc = this.loadKubeConfig(region)
    return kc.makeApiClient(k8s.AutoscalingV2Api)
  }

  makeNetworkingApi(region: Region) {
    const kc = this.loadKubeConfig(region)
    return kc.makeApiClient(k8s.NetworkingV1Api)
  }
}

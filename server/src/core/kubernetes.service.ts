import { Injectable } from '@nestjs/common'
import * as k8s from '@kubernetes/client-node'
import { KubernetesObject } from '@kubernetes/client-node'
import { compare } from 'fast-json-patch'
import { GroupVersionKind } from './kubernetes.interface'
import path from 'path'

/**
 * Single instance of the Kubernetes API client.
 */
let config: k8s.KubeConfig = null

@Injectable()
export class KubernetesService {
  get config() {
    if (!config) {
      config = new k8s.KubeConfig()
      config.loadFromDefault()
    }
    return config
  }

  get coreV1Api() {
    return this.config.makeApiClient(k8s.CoreV1Api)
  }

  get appsV1Api() {
    return this.config.makeApiClient(k8s.AppsV1Api)
  }

  get objectApi() {
    return this.config.makeApiClient(k8s.KubernetesObjectApi)
  }

  get customObjectApi() {
    return this.config.makeApiClient(k8s.CustomObjectsApi)
  }

  async createNamespace(name: string) {
    const namespace = new k8s.V1Namespace()
    namespace.metadata = new k8s.V1ObjectMeta()
    namespace.metadata.name = name
    const res = await this.coreV1Api.createNamespace(namespace)
    return res.body
  }

  async deleteNamespace(name: string) {
    const res = await this.coreV1Api.deleteNamespace(name)
    return res.body
  }

  async existsNamespace(name: string) {
    try {
      const res = await this.coreV1Api.readNamespace(name)
      return res.body
    } catch (error) {
      return false
    }
  }

  async applyYamlString(specString: string) {
    const client = this.objectApi
    const specs: k8s.KubernetesObject[] = k8s.loadAllYaml(specString)
    const validSpecs = specs.filter((s) => s && s.kind && s.metadata)
    const created: k8s.KubernetesObject[] = []

    for (const spec of validSpecs) {
      // this is to convince the old version of TypeScript that metadata exists even though we already filtered specs
      // without metadata out
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
        await client.read(spec as any)
        // we got the resource, so it exists, so patch it
        //
        // Note that this could fail if the spec refers to a custom resource. For custom resources you may need
        // to specify a different patch merge strategy in the content-type header.
        //
        // See: https://github.com/kubernetes/kubernetes/issues/97423
        const response = await client.patch(spec)
        created.push(response.body)
      } catch (e) {
        // we did not get the resource, so it does not exist, so create it
        const response = await client.create(spec)
        created.push(response.body)
      }
    }
    return created
  }

  async deleteYamlString(specString: string) {
    const client = this.objectApi
    const specs: k8s.KubernetesObject[] = k8s.loadAllYaml(specString)
    const validSpecs = specs.filter((s) => s && s.kind && s.metadata)
    const deleted: k8s.KubernetesObject[] = []

    for (const spec of validSpecs) {
      try {
        // try to get the resource, if it does not exist an error will be thrown and we will end up in the catch
        // block.
        await client.read(spec as any)
        // we got the resource, so it exists, so delete it
        const response = await client.delete(spec)
        deleted.push(response.body)
      } catch (e) {
        // we did not get the resource, so it does not exist, so do nothing
      }
    }
    return deleted
  }

  async patchCustomObject(spec: KubernetesObject) {
    const client = this.customObjectApi
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
}

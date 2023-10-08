import { Injectable, Logger } from '@nestjs/common'
import { LABEL_KEY_APP_ID } from 'src/constants'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { Region } from 'src/region/entities/region'
import { GetApplicationNamespace } from 'src/utils/getter'
import { WebsiteHosting } from 'src/website/entities/website'
import { RuntimeDomain } from './entities/runtime-domain'

// This class handles the creation and deletion of website domain certificates
@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name)
  constructor(private readonly clusterService: ClusterService) {}

  getRuntimeCertificateName(domain: RuntimeDomain) {
    return `${domain.appid}-runtime-custom-domain`
  }

  getWebsiteCertificateName(website: WebsiteHosting) {
    return `${website._id.toString()}-website-custom`
  }

  // Read a certificate for a given website using cert-manager.io CRD
  async getWebsiteCertificate(region: Region, website: WebsiteHosting) {
    const namespace = GetApplicationNamespace(region, website.appid)
    const name = this.getWebsiteCertificateName(website)
    return await this.read(region, name, namespace)
  }

  // Create a certificate for a given website using cert-manager.io CRD
  async createWebsiteCertificate(region: Region, website: WebsiteHosting) {
    const namespace = GetApplicationNamespace(region, website.appid)
    const name = this.getWebsiteCertificateName(website)
    return await this.create(region, name, namespace, website.domain, {
      'laf.dev/website': website._id.toString(),
      'laf.dev/website-domain': website.domain,
      [LABEL_KEY_APP_ID]: website.appid,
    })
  }

  // Delete a certificate for a given website using cert-manager.io CRD
  async deleteWebsiteCertificate(region: Region, website: WebsiteHosting) {
    const namespace = GetApplicationNamespace(region, website.appid)
    const name = this.getWebsiteCertificateName(website)
    return await this.remove(region, name, namespace)
  }

  // Read a certificate for app custom domain using cert-manager.io CRD
  async getRuntimeCertificate(region: Region, runtimeDomain: RuntimeDomain) {
    const namespace = GetApplicationNamespace(region, runtimeDomain.appid)
    const name = this.getRuntimeCertificateName(runtimeDomain)
    return await this.read(region, name, namespace)
  }

  // Create a certificate for app custom domain using cert-manager.io CRD
  async createRuntimeCertificate(region: Region, runtimeDomain: RuntimeDomain) {
    const namespace = GetApplicationNamespace(region, runtimeDomain.appid)
    const name = this.getRuntimeCertificateName(runtimeDomain)
    return await this.create(
      region,
      name,
      namespace,
      runtimeDomain.customDomain,
      {
        'laf.dev/runtime-domain': runtimeDomain.customDomain,
        [LABEL_KEY_APP_ID]: runtimeDomain.appid,
      },
    )
  }

  // Delete a certificate for app custom domain using cert-manager.io CRD
  async deleteRuntimeCertificate(region: Region, runtimeDomain: RuntimeDomain) {
    const namespace = GetApplicationNamespace(region, runtimeDomain.appid)
    const name = this.getRuntimeCertificateName(runtimeDomain)
    return await this.remove(region, name, namespace)
  }

  private async read(region: Region, name: string, namespace: string) {
    try {
      const api = this.clusterService.makeCustomObjectApi(region)
      const res = await api.getNamespacedCustomObject(
        'cert-manager.io',
        'v1',
        namespace,
        'certificates',
        name,
      )

      return res.body
    } catch (err) {
      if (err?.response?.body?.reason === 'NotFound') return null
      this.logger.error(err)
      this.logger.error(err?.response?.body)
      throw err
    }
  }

  private async create(
    region: Region,
    name: string,
    namespace: string,
    domain: string,
    labels: Record<string, string>,
  ) {
    const api = this.clusterService.makeObjectApi(region)
    const res = await api.create({
      apiVersion: 'cert-manager.io/v1',
      kind: 'Certificate',
      // Set the metadata for the Certificate resource
      metadata: {
        name,
        namespace,
        labels,
      },
      // Define the specification for the Certificate resource
      spec: {
        secretName: name,
        dnsNames: [domain],
        issuerRef: region.gatewayConf.tls.issuerRef,
      },
    })
    return res.body
  }

  private async remove(region: Region, name: string, namespace: string) {
    const api = this.clusterService.makeObjectApi(region)

    // Make a request to delete the Certificate resource
    const res = await api.delete({
      apiVersion: 'cert-manager.io/v1',
      kind: 'Certificate',
      metadata: {
        name,
        namespace,
      },
    })

    // GC the secret
    await api
      .delete({
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          name,
          namespace,
        },
      })
      // Ignore errors, as the secret may not exist
      .catch((err) => {
        this.logger.error(err)
        this.logger.error(err?.response?.body)
      })

    return res.body
  }
}

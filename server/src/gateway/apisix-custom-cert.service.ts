import { Injectable, Logger } from '@nestjs/common'
import { LABEL_KEY_APP_ID, ServerConfig } from 'src/constants'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { Region } from 'src/region/entities/region'
import { GetApplicationNamespaceByAppId } from 'src/utils/getter'
import { WebsiteHosting } from 'src/website/entities/website'
import { RuntimeDomain } from './entities/runtime-domain'

// This class handles the creation and deletion of website domain certificates
// and ApisixTls resources using Kubernetes Custom Resource Definitions (CRDs).
@Injectable()
export class ApisixCustomCertService {
  private readonly logger = new Logger(ApisixCustomCertService.name)
  constructor(private readonly clusterService: ClusterService) {}

  async readDomainCert(region: Region, appid: string, name: string) {
    try {
      // Get the namespace based on the application ID
      const namespace = GetApplicationNamespaceByAppId(appid)
      // Create a Kubernetes API client for the specified region
      const api = this.clusterService.makeCustomObjectApi(region)

      // Make a request to read the Certificate resource
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

  async createDomainCert(
    region: Region,
    appid: string,
    name: string,
    domain: string,
    labels: Record<string, string>,
  ) {
    // Get the namespace based on the application ID
    const namespace = GetApplicationNamespaceByAppId(appid)
    // Create a Kubernetes API client for the specified region
    const api = this.clusterService.makeObjectApi(region)

    // Make a request to create the Certificate resource
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
        issuerRef: {
          name: ServerConfig.CertManagerIssuerName,
          kind: 'ClusterIssuer',
        },
      },
    })
    return res.body
  }

  async deleteDomainCert(region: Region, appid: string, name: string) {
    // Get the namespace based on the application ID
    const namespace = GetApplicationNamespaceByAppId(appid)
    // Create a Kubernetes API client for the specified region
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

  async readApisixTls(region: Region, appid: string, name: string) {
    try {
      // Get the namespace based on the application ID
      const namespace = GetApplicationNamespaceByAppId(appid)
      // Create an API object for the specified region
      const api = this.clusterService.makeCustomObjectApi(region)

      // Make a request to read the ApisixTls resource
      const res = await api.getNamespacedCustomObject(
        'apisix.apache.org',
        'v2',
        namespace,
        'apisixtlses',
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

  async createApisixTls(
    region: Region,
    appid: string,
    name: string,
    domain: string,
    labels: Record<string, string>,
  ) {
    // Get the namespace based on the application ID
    const namespace = GetApplicationNamespaceByAppId(appid)
    // Create an API object for the specified region
    const api = this.clusterService.makeObjectApi(region)

    // Make a request to create the ApisixTls resource
    const res = await api.create({
      apiVersion: 'apisix.apache.org/v2',
      kind: 'ApisixTls',
      // Set the metadata for the ApisixTls resource
      metadata: {
        name,
        namespace,
        labels,
      },
      // Define the specification for the ApisixTls resource
      spec: {
        hosts: [domain],
        secret: {
          name,
          namespace,
        },
      },
    })
    return res.body
  }

  async deleteApisixTls(region: Region, appid: string, name: string) {
    // Get the application namespace using the website's appid
    const namespace = GetApplicationNamespaceByAppId(appid)

    // Create an API object for the specified region
    const api = this.clusterService.makeObjectApi(region)

    // Send a delete request to remove the APISIX TLS configuration
    const res = await api.delete({
      apiVersion: 'apisix.apache.org/v2',
      kind: 'ApisixTls',
      metadata: {
        name,
        namespace,
      },
    })

    return res.body
  }

  // Read a certificate for a given website using cert-manager.io CRD
  async readWebsiteDomainCert(region: Region, website: WebsiteHosting) {
    return await this.readDomainCert(
      region,
      website.appid,
      website._id.toString(),
    )
  }

  // Create a certificate for a given website using cert-manager.io CRD
  async createWebsiteDomainCert(region: Region, website: WebsiteHosting) {
    return await this.createDomainCert(
      region,
      website.appid,
      website._id.toString(),
      website.domain,
      {
        'laf.dev/website': website._id.toString(),
        'laf.dev/website-domain': website.domain,
        [LABEL_KEY_APP_ID]: website.appid,
      },
    )
  }

  // Delete a certificate for a given website using cert-manager.io CRD
  async deleteWebsiteDomainCert(region: Region, website: WebsiteHosting) {
    return await this.deleteDomainCert(
      region,
      website.appid,
      website._id.toString(),
    )
  }

  // Read an ApisixTls resource for a given website using apisix.apache.org CRD
  async readWebsiteApisixTls(region: Region, website: WebsiteHosting) {
    return await this.readApisixTls(
      region,
      website.appid,
      website._id.toString(),
    )
  }

  // Create an ApisixTls resource for a given website using apisix.apache.org CRD
  async createWebsiteApisixTls(region: Region, website: WebsiteHosting) {
    return await this.createApisixTls(
      region,
      website.appid,
      website._id.toString(),
      website.domain,
      {
        'laf.dev/website': website._id.toString(),
        'laf.dev/website-domain': website.domain,
        [LABEL_KEY_APP_ID]: website.appid,
      },
    )
  }

  // Deletes the APISIX TLS configuration for a specific website domain
  async deleteWebsiteApisixTls(region: Region, website: WebsiteHosting) {
    return await this.deleteApisixTls(
      region,
      website.appid,
      website._id.toString(),
    )
  }

  // ========= App Custom Domain
  // Read a certificate for app custom domain using cert-manager.io CRD
  async readAppCustomDomainCert(region: Region, runtimeDomain: RuntimeDomain) {
    return await this.readDomainCert(
      region,
      runtimeDomain.appid,
      runtimeDomain.appid,
    )
  }

  // Create a certificate for app custom domain using cert-manager.io CRD
  async createAppCustomDomainCert(
    region: Region,
    runtimeDomain: RuntimeDomain,
  ) {
    return await this.createDomainCert(
      region,
      runtimeDomain.appid,
      runtimeDomain.appid,
      runtimeDomain.customDomain,
      {
        'laf.dev/app-custom-domain': runtimeDomain.customDomain,
        [LABEL_KEY_APP_ID]: runtimeDomain.appid,
      },
    )
  }

  // Delete a certificate for app custom domain using cert-manager.io CRD
  async deleteAppCustomDomainCert(
    region: Region,
    runtimeDomain: RuntimeDomain,
  ) {
    return await this.deleteDomainCert(
      region,
      runtimeDomain.appid,
      runtimeDomain.appid,
    )
  }

  // Read an ApisixTls resource for app custom domain using apisix.apache.org CRD
  async readAppCustomDomainApisixTls(
    region: Region,
    runtimeDomain: RuntimeDomain,
  ) {
    return await this.readApisixTls(
      region,
      runtimeDomain.appid,
      runtimeDomain.appid,
    )
  }

  // Create an ApisixTls resource for app custom domain using apisix.apache.org CRD
  async createAppCustomDomainApisixTls(
    region: Region,
    runtimeDomain: RuntimeDomain,
  ) {
    return await this.createApisixTls(
      region,
      runtimeDomain.appid,
      runtimeDomain.appid,
      runtimeDomain.customDomain,
      {
        'laf.dev/app-custom-domain': runtimeDomain.customDomain,
        [LABEL_KEY_APP_ID]: runtimeDomain.appid,
      },
    )
  }

  // Deletes the APISIX TLS configuration for app custom domain
  async deleteAppCustomDomainApisixTls(
    region: Region,
    runtimeDomain: RuntimeDomain,
  ) {
    return await this.deleteApisixTls(
      region,
      runtimeDomain.appid,
      runtimeDomain.appid,
    )
  }
}

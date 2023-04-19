import { Injectable, Logger } from '@nestjs/common'
import { Region, WebsiteHosting } from '@prisma/client'
import { LABEL_KEY_APP_ID, ServerConfig } from 'src/constants'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { GetApplicationNamespaceByAppId } from 'src/utils/getter'

// This class handles the creation and deletion of website domain certificates
// and ApisixTls resources using Kubernetes Custom Resource Definitions (CRDs).
@Injectable()
export class ApisixCustomCertService {
  private readonly logger = new Logger(ApisixCustomCertService.name)
  constructor(private readonly clusterService: ClusterService) {}

  // Read a certificate for a given website using cert-manager.io CRD
  async readWebsiteDomainCert(region: Region, website: WebsiteHosting) {
    try {
      // Get the namespace based on the application ID
      const namespace = GetApplicationNamespaceByAppId(website.appid)
      // Create a Kubernetes API client for the specified region
      const api = this.clusterService.makeCustomObjectApi(region)

      // Make a request to read the Certificate resource
      const res = await api.getNamespacedCustomObject(
        'cert-manager.io',
        'v1',
        namespace,
        'certificates',
        website.id,
      )

      return res.body
    } catch (err) {
      if (err?.response?.body?.reason === 'NotFound') return null
      this.logger.error(err)
      this.logger.error(err?.response?.body)
      throw err
    }
  }

  // Create a certificate for a given website using cert-manager.io CRD
  async createWebsiteDomainCert(region: Region, website: WebsiteHosting) {
    // Get the namespace based on the application ID
    const namespace = GetApplicationNamespaceByAppId(website.appid)
    // Create a Kubernetes API client for the specified region
    const api = this.clusterService.makeObjectApi(region)

    // Make a request to create the Certificate resource
    const res = await api.create({
      apiVersion: 'cert-manager.io/v1',
      kind: 'Certificate',
      // Set the metadata for the Certificate resource
      metadata: {
        name: website.id,
        namespace,
        labels: {
          'laf.dev/website': website.id,
          'laf.dev/website-domain': website.domain,
          [LABEL_KEY_APP_ID]: website.appid,
        },
      },
      // Define the specification for the Certificate resource
      spec: {
        secretName: website.id,
        dnsNames: [website.domain],
        issuerRef: {
          name: ServerConfig.CertManagerIssuerName,
          kind: 'ClusterIssuer',
        },
      },
    })
    return res.body
  }

  // Delete a certificate for a given website using cert-manager.io CRD
  async deleteWebsiteDomainCert(region: Region, website: WebsiteHosting) {
    // Get the namespace based on the application ID
    const namespace = GetApplicationNamespaceByAppId(website.appid)
    // Create a Kubernetes API client for the specified region
    const api = this.clusterService.makeObjectApi(region)

    // Make a request to delete the Certificate resource
    const res = await api.delete({
      apiVersion: 'cert-manager.io/v1',
      kind: 'Certificate',
      metadata: {
        name: website.id,
        namespace,
      },
    })

    // GC the secret
    await api
      .delete({
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          name: website.id,
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

  // Read an ApisixTls resource for a given website using apisix.apache.org CRD
  async readWebsiteApisixTls(region: Region, website: WebsiteHosting) {
    try {
      // Get the namespace based on the application ID
      const namespace = GetApplicationNamespaceByAppId(website.appid)
      // Create an API object for the specified region
      const api = this.clusterService.makeCustomObjectApi(region)

      // Make a request to read the ApisixTls resource
      const res = await api.getNamespacedCustomObject(
        'apisix.apache.org',
        'v2',
        namespace,
        'apisixtlses',
        website.id,
      )
      return res.body
    } catch (err) {
      if (err?.response?.body?.reason === 'NotFound') return null
      this.logger.error(err)
      this.logger.error(err?.response?.body)
      throw err
    }
  }

  // Create an ApisixTls resource for a given website using apisix.apache.org CRD
  async createWebsiteApisixTls(region: Region, website: WebsiteHosting) {
    // Get the namespace based on the application ID
    const namespace = GetApplicationNamespaceByAppId(website.appid)
    // Create an API object for the specified region
    const api = this.clusterService.makeObjectApi(region)

    // Make a request to create the ApisixTls resource
    const res = await api.create({
      apiVersion: 'apisix.apache.org/v2',
      kind: 'ApisixTls',
      // Set the metadata for the ApisixTls resource
      metadata: {
        name: website.id,
        namespace,
        labels: {
          'laf.dev/website': website.id,
          'laf.dev/website-domain': website.domain,
          [LABEL_KEY_APP_ID]: website.appid,
        },
      },
      // Define the specification for the ApisixTls resource
      spec: {
        hosts: [website.domain],
        secret: {
          name: website.id,
          namespace,
        },
      },
    })
    return res.body
  }

  // Deletes the APISIX TLS configuration for a specific website domain
  async deleteWebsiteApisixTls(region: Region, website: WebsiteHosting) {
    // Get the application namespace using the website's appid
    const namespace = GetApplicationNamespaceByAppId(website.appid)

    // Create an API object for the specified region
    const api = this.clusterService.makeObjectApi(region)

    // Send a delete request to remove the APISIX TLS configuration
    const res = await api.delete({
      apiVersion: 'apisix.apache.org/v2',
      kind: 'ApisixTls',
      metadata: {
        name: website.id,
        namespace,
      },
    })

    return res.body
  }
}

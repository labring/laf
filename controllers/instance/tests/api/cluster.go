package api

import (
	baseapi "github.com/labring/laf/tests/api"
	v1 "github/labring/laf/controllers/instance/api/v1"
	"k8s.io/client-go/tools/clientcmd"
	"os"
)

const clusterYaml = `
apiVersion: instance.laf.dev/v1
kind: Cluster
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  region: ${region} 
  clientConfig: 
    server: ${server}
    certificateAuthorityData: |
      -----BEGIN CERTIFICATE-----
      MIIC6TCCAdGgAwIBAgIBADANBgkqhkiG9w0BAQsFADAVMRMwEQYDVQQDEwprdWJl
      cm5ldGVzMCAXDTIyMTAxMzA4MjQyNloYDzIxMjIwOTE5MDgyNDI2WjAVMRMwEQYD
      VQQDEwprdWJlcm5ldGVzMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
      nKnMzkt41mS6VNU+txiHiJEbfqwFSScGgau666wPSMEHQsS30GaiicEW2Bu92z3S
      dtc4VbNnGPygDgCxR+/Jx6N38EbwTbcmlRSRdmtSy6QI9uZJBA/AMrMaE9BC7sT0
      TMYuzJ5AUl+FfrX1wSFy7Lxm02+IO5SXhnyrRnhbWF0DTsC4SgjdEd+T7XbD6vEr
      j+TY8E4dcSAH4EoARMotix8rH1RXERxmXb5xgx0x1myaCpX13nOVvKnXk0tbdXd9
      fMksQC8N7ntoY8AoqFZU2SdxO9ZoFfVjTYrRDpdxA2WmPnQig5YYVBy22gS1vAYu
      it6Hni82z350ET15BPlauwIDAQABo0IwQDAOBgNVHQ8BAf8EBAMCAqQwDwYDVR0T
      AQH/BAUwAwEB/zAdBgNVHQ4EFgQUaITtGTAz7PT3EfNrgnBAobj73iEwDQYJKoZI
      hvcNAQELBQADggEBAFwNHv/lV1+Vry2GywOWMBpsnM6ywEdPpD9wERnZUrTiu5/O
      CM0n5Vn8+XL/d0I3xTTYevh/XKFp1bVGh1g6Bdcj9ODoJH+QTAPU1+8z/C1L4K8B
      DDUjCNA2b3C8/ZQhtab3H71q4/z/YHetDcvGHVJnPovNta5Qqkqz+NtOKRvtl7Vd
      71WuKunMcJptw/9Muxrt7jwl3CCLtRkAL1tyBVYNzJcytpY/UzQEFo6bmeyk0HHA
      eIp/8IzCFvtxM4KgPe2ikM4lSMZNCCrbdJqLe0rdcYpszeLkM7rGdrtnZ1vntmwc
      1E5W0Ioxxz8VKyTtJgMB5NS5HDze6HntO9Knadk=
      -----END CERTIFICATE-----
    userClientCertificateData: |
      -----BEGIN CERTIFICATE-----
      MIIDFTCCAf2gAwIBAgIILlwj3IPDYfMwDQYJKoZIhvcNAQELBQAwFTETMBEGA1UE
      AxMKa3ViZXJuZXRlczAgFw0yMjEwMTMwODI0MjZaGA8yMTIyMDkxOTA4MjQzMFow
      NDEXMBUGA1UEChMOc3lzdGVtOm1hc3RlcnMxGTAXBgNVBAMTEGt1YmVybmV0ZXMt
      YWRtaW4wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDGr8Tw9S6gTKT7
      yjFAldGJIXwP4dwazps7I5ZfCtmliDvlLnwFOOO1qmjoK8zpK4gW/eVpPIIb9Don
      hSvtJM7Jnf4oB2hTLRaDHMCfzev4CfLX64RPsP1toFoRc5g1qtjdXPRoq0JqN4Py
      09NIPB/7Qsawh0L9z5O7VAhmnHPX83nePrH9w1kieeUeMCfH4m7dLynEZ0FgXEqm
      NxCABT4Shdk4kL9ftrM1kizfi8bfSQTZHrzYKZ9ZJuDPoZKQ+Puew8cZsq6qwgNi
      dWDg93Zev1rvbOJnyrR0xJo+Vf0f9RRKVtrJqIXtY8uYOhJYljmWF3oK5IaPektu
      B5heXIZfAgMBAAGjSDBGMA4GA1UdDwEB/wQEAwIFoDATBgNVHSUEDDAKBggrBgEF
      BQcDAjAfBgNVHSMEGDAWgBRohO0ZMDPs9PcR82uCcEChuPveITANBgkqhkiG9w0B
      AQsFAAOCAQEAjcXCjMN7/WjIueSoeVuQXiwNQeB+i1KFuw4PdFwkavIUsAKxV3rQ
      DE3hhQcLu8R/tWIJ5u2scuLzj7vWd9boQavJpyul8D5pZTiCIhwlhy0d6vweyjaz
      pQmYDoOJpapBfWpihiw/NzVA6bXjDpMz+s0U5k3sSTk4yqqEBcQLIl4FecVnSNES
      BWfONjaD2rn6n1uGLEAV5/RsFHlA9bcR62hp2cUQDG18UdAwEjTePereVadB6CUv
      xvUb+Rx93GnhdoTtRICVaqPBYLePP+593cQq5i97EUhgqRoYWIG9X0hez+LEjLC2
      ME+B6I+tI24Rdf85kuTkmf28Ll3AweRqVg==
      -----END CERTIFICATE-----
    userClientKeyData: |
      -----BEGIN RSA PRIVATE KEY-----
      MIIEogIBAAKCAQEAxq/E8PUuoEyk+8oxQJXRiSF8D+HcGs6bOyOWXwrZpYg75S58
      BTjjtapo6CvM6SuIFv3laTyCG/Q6J4Ur7STOyZ3+KAdoUy0WgxzAn83r+Any1+uE
      T7D9baBaEXOYNarY3Vz0aKtCajeD8tPTSDwf+0LGsIdC/c+Tu1QIZpxz1/N53j6x
      /cNZInnlHjAnx+Ju3S8pxGdBYFxKpjcQgAU+EoXZOJC/X7azNZIs34vG30kE2R68
      2CmfWSbgz6GSkPj7nsPHGbKuqsIDYnVg4Pd2Xr9a72ziZ8q0dMSaPlX9H/UUSlba
      yaiF7WPLmDoSWJY5lhd6CuSGj3pLbgeYXlyGXwIDAQABAoIBAAXL6vr8rDeRBN8z
      ruwrcsmFaJEuDbXagTzgdOqg7mid6OFu0b91QW9zYUwkuv2yf23sSl0fnswh+/Bb
      OkTY5g+LxHZ2gNysXBPHKvd+knvSDnuuK1YH29zu6LHJpY8rRNhwddD37iAbLoZP
      F8LrviMed51+1L2C6NR2Ryh3OAn8y04aPoHM01rSI01sT39CEPQaTSVKSrnlFZlq
      8KRQYLaSSEqDA96YGK4Z0pXMre3j607/j2XHonuHZNVt0Hp4pe0g2Sw3CP2i7nTz
      P/Jazps2lMRxEWQZXOCdofVz7UWp0pZHGqeskgS/ow71WH9+vYihhiWnzEBtGj0n
      RZk9SAECgYEA2RZ2uA902OBpesViIMA/NU5DDsa8iyvNj651qy6tuYoOwV28etnO
      znB3cyaJ8SlnWvjrL5kgQkanPjzjMy/UQ2pP5/ApeZ8XolVfuS8xOzshOFAK+0hD
      vOfh6wPxBNfQ3QU3GucBuK9NoDDIcqoeC7hIVQTNAKrNTDtEqpnrqt8CgYEA6kzt
      63b3DJ+WjtL3JIstX0sBXGJtp7hU9QJlALs/R56Oz3J8ptn+fApkiqTBEVmEUJTW
      lAd3p6C1JJr1R8a/+umjOpn6DMnNLacZSK9DbK0ZUVj6Sx4WXh0m5F8Yjgbse88S
      xWeTS3WQTd5I/l0qYm+b5N2qAy95Oc7xsKT+FIECgYAD7o856DXCk9X1Pkv3seOz
      MHawdtMFZkaz2oIRFqhY2vJHeE4on3dKb+kJ8eG/t3NCx41i8FAQQz1WOD4ZOD2M
      9wj5d3UY2dPQweEY9ozauMhyP6jjQjzP2BdUbV7ZKpuC1UxZNWPnl209gISw5vni
      VnUg7RRVdcKAJfapbF5DWwKBgCautMkfRwJqhqzl36/E2qTU+VCLX5dFM6GP16Ub
      RQNKBkHxoOrbKszH2nmZYda/dLzpFdQyt2qRedalTsGe6qs+T5ipO0NJPfq/j8kU
      Rol2uqtXiVtFiGPZZEZn/OHV+s0mDu9Qfl0C9+QjQuHb99dwnchXYG5ONDF7HSQQ
      2XIBAoGAF7gvthjbvNYfUNdPXJuweeQ2rsEv7Z2cWtUKbGVHsGR15tF2b5f7rLQb
      1uRvWbho6zeNkhqq+ZGg7W9JEeBcn2hevZh2i+FudsYp82lhS8aWMsCM1vYs+wMu
      iFXWpqEDMopVrxsiHP8ejnAk4ofQufODhksKB16ecjc/E/mtY30=
      -----END RSA PRIVATE KEY-----
`

func CreateCluster(namespace string, name string, region string) error {
	filename := clientcmd.NewDefaultClientConfigLoadingRules().GetDefaultFilename()
	data, err := os.ReadFile(filename)
	if err != nil {
		return err
	}
	load, err := clientcmd.Load(data)

	baseapi.MustKubeApplyFromTemplate(clusterYaml, map[string]string{
		"name":                      name,
		"namespace":                 namespace,
		"region":                    region,
		"server":                    load.Clusters["kubernetes"].Server,
		"certificateAuthorityData":  string(load.Clusters["kubernetes"].CertificateAuthorityData),
		"userClientCertificateData": string(load.AuthInfos["kubernetes-admin"].ClientCertificateData),
		"userClientKeyData":         string(load.AuthInfos["kubernetes-admin"].ClientKeyData),
	})
	return nil
}

func GetCluster(namespace string, name string) (*v1.Cluster, error) {
	gvr := v1.GroupVersion.WithResource("clusters")
	cluster := &v1.Cluster{}
	if err := baseapi.GetObject(namespace, name, gvr, cluster); err != nil {
		return nil, err
	}

	return cluster, nil
}

func DeleteCluster(namespace string, name string) {
	baseapi.MustKubeDeleteFromTemplate(clusterYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
}

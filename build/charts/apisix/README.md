## Apache APISIX for Kubernetes

Apache APISIX is a dynamic, real-time, high-performance API gateway.

APISIX provides rich traffic management features such as load balancing, dynamic upstream, canary release, circuit breaking, authentication, observability, and more.

You can use Apache APISIX to handle traditional north-south traffic, as well as east-west traffic between services. It can also be used as a [k8s ingress controller](https://github.com/apache/apisix-ingress-controller/).

This chart bootstraps all the components needed to run Apache APISIX on a Kubernetes Cluster using [Helm](https://helm.sh).

## Prerequisites

* Kubernetes v1.14+
* Helm v3+

## Install

To install the chart with the release name `my-apisix`:

```sh
helm repo add apisix https://charts.apiseven.com
helm repo update

helm install [RELEASE_NAME] apisix/apisix --namespace ingress-apisix --create-namespace
```

## Uninstall

 To uninstall/delete a Helm release `my-apisix`:

 ```sh
helm delete [RELEASE_NAME] --namespace ingress-apisix
 ```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Parameters

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| admin.allow.ipList | list | `["127.0.0.1/24"]` | The client IP CIDR allowed to access Apache APISIX Admin API service. |
| admin.cors | bool | `true` | Admin API support CORS response headers |
| admin.credentials | object | `{"admin":"edd1c9f034335f136f87ad84b625c8f1","secretName":"","viewer":"4054f7cf07e344346cd3f287985e76a2"}` | Admin API credentials |
| admin.credentials.admin | string | `"edd1c9f034335f136f87ad84b625c8f1"` | Apache APISIX admin API admin role credentials |
| admin.credentials.secretName | string | `""` | The APISIX Helm chart supports storing user credentials in a secret. The secret needs to contain two keys, admin and viewer, with their respective values set. |
| admin.credentials.viewer | string | `"4054f7cf07e344346cd3f287985e76a2"` | Apache APISIX admin API viewer role credentials |
| admin.enabled | bool | `true` | Enable Admin API |
| admin.externalIPs | list | `[]` | IPs for which nodes in the cluster will also accept traffic for the servic |
| admin.ingress | object | `{"annotations":{},"enabled":false,"hosts":[{"host":"apisix-admin.local","paths":["/apisix"]}],"tls":[]}` | Using ingress access Apache APISIX admin service |
| admin.ingress.annotations | object | `{}` | Ingress annotations |
| admin.ip | string | `"0.0.0.0"` | which ip to listen on for Apache APISIX admin API. Set to `"[::]"` when on IPv6 single stack |
| admin.port | int | `9180` | which port to use for Apache APISIX admin API |
| admin.servicePort | int | `9180` | Service port to use for Apache APISIX admin API |
| admin.type | string | `"ClusterIP"` | admin service type |
| apisix.affinity | object | `{}` | Set affinity for Apache APISIX deploy |
| apisix.customLuaSharedDicts | list | `[]` | Add custom [lua_shared_dict](https://github.com/openresty/lua-nginx-module#toc88) settings, click [here](https://github.com/apache/apisix-helm-chart/blob/master/charts/apisix/values.yaml#L27-L30) to learn the format of a shared dict |
| apisix.customizedConfig | object | `{}` | If apisix.enableCustomizedConfig is true, full customized config.yaml. Please note that other settings about APISIX config will be ignored |
| apisix.enableCustomizedConfig | bool | `false` | Enable full customized config.yaml |
| apisix.enableIPv6 | bool | `true` | Enable nginx IPv6 resolver |
| apisix.enableServerTokens | bool | `true` | Whether the APISIX version number should be shown in Server header |
| apisix.enabled | bool | `true` | Enable or disable Apache APISIX itself Set it to false and ingress-controller.enabled=true will deploy only ingress-controller |
| apisix.extraEnvVars | list | `[]` | extraEnvVars An array to add extra env vars e.g: extraEnvVars:   - name: FOO     value: "bar"   - name: FOO2     valueFrom:       secretKeyRef:         name: SECRET_NAME         key: KEY |
| apisix.hostNetwork | bool | `false` |  |
| apisix.httpRouter | string | `"radixtree_host_uri"` | Defines how apisix handles routing: - radixtree_uri: match route by uri(base on radixtree) - radixtree_host_uri: match route by host + uri(base on radixtree) - radixtree_uri_with_parameter: match route by uri with parameters |
| apisix.image.pullPolicy | string | `"IfNotPresent"` | Apache APISIX image pull policy |
| apisix.image.repository | string | `"apache/apisix"` | Apache APISIX image repository |
| apisix.image.tag | string | `"3.3.0-debian"` | Apache APISIX image tag Overrides the image tag whose default is the chart appVersion. |
| apisix.kind | string | `"Deployment"` | Use a `DaemonSet` or `Deployment` |
| apisix.luaModuleHook | object | `{"configMapRef":{"mounts":[{"key":"","path":""}],"name":""},"enabled":false,"hookPoint":"","luaPath":""}` | Whether to add a custom lua module |
| apisix.luaModuleHook.configMapRef | object | `{"mounts":[{"key":"","path":""}],"name":""}` | configmap that stores the codes |
| apisix.luaModuleHook.configMapRef.mounts[0] | object | `{"key":"","path":""}` | Name of the ConfigMap key, for setting the mapping relationship between ConfigMap key and the lua module code path. |
| apisix.luaModuleHook.configMapRef.mounts[0].path | string | `""` | Filepath of the plugin code, for setting the mapping relationship between ConfigMap key and the lua module code path. |
| apisix.luaModuleHook.configMapRef.name | string | `""` | Name of the ConfigMap where the lua module codes store |
| apisix.luaModuleHook.hookPoint | string | `""` | the hook module which will be used to inject third party code into APISIX use the lua require style like: "module.say_hello" |
| apisix.luaModuleHook.luaPath | string | `""` | extend lua_package_path to load third party code |
| apisix.nodeSelector | object | `{}` | Node labels for Apache APISIX pod assignment |
| apisix.podAnnotations | object | `{}` | Annotations to add to each pod |
| apisix.podDisruptionBudget | object | `{"enabled":false,"maxUnavailable":1,"minAvailable":"90%"}` | See https://kubernetes.io/docs/tasks/run-application/configure-pdb/ for more details |
| apisix.podDisruptionBudget.enabled | bool | `false` | Enable or disable podDisruptionBudget |
| apisix.podDisruptionBudget.maxUnavailable | int | `1` | Set the maxUnavailable of podDisruptionBudget |
| apisix.podDisruptionBudget.minAvailable | string | `"90%"` | Set the `minAvailable` of podDisruptionBudget. You can specify only one of `maxUnavailable` and `minAvailable` in a single PodDisruptionBudget. See [Specifying a Disruption Budget for your Application](https://kubernetes.io/docs/tasks/run-application/configure-pdb/#specifying-a-poddisruptionbudget) for more details |
| apisix.podSecurityContext | object | `{}` | Set the securityContext for Apache APISIX pods |
| apisix.priorityClassName | string | `""` | Set [priorityClassName](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/#pod-priority) for Apache APISIX pods |
| apisix.replicaCount | int | `1` | kind is DaemonSet, replicaCount not become effective |
| apisix.resources | object | `{}` | Set pod resource requests & limits |
| apisix.securityContext | object | `{}` | Set the securityContext for Apache APISIX container |
| apisix.setIDFromPodUID | bool | `false` | Use Pod metadata.uid as the APISIX id. |
| apisix.timezone | string | `""` | timezone is the timezone where apisix uses. For example: "UTC" or "Asia/Shanghai" This value will be set on apisix container's environment variable TZ. You may need to set the timezone to be consistent with your local time zone, otherwise the apisix's logs may used to retrieve event maybe in wrong timezone. |
| apisix.tolerations | list | `[]` | List of node taints to tolerate |
| autoscaling.enabled | bool | `false` |  |
| autoscaling.maxReplicas | int | `100` |  |
| autoscaling.minReplicas | int | `1` |  |
| autoscaling.targetCPUUtilizationPercentage | int | `80` |  |
| autoscaling.targetMemoryUtilizationPercentage | int | `80` |  |
| autoscaling.version | string | `"v2"` | HPA version, the value is "v2" or "v2beta1", default "v2" |
| configurationSnippet | object | `{"httpAdmin":"","httpEnd":"","httpSrv":"","httpStart":"","main":"","stream":""}` | Custom configuration snippet. |
| customPlugins | object | `{"enabled":false,"luaPath":"/opts/custom_plugins/?.lua","plugins":[{"attrs":{},"configMap":{"mounts":[{"key":"the-file-name","path":"mount-path"}],"name":"configmap-name"},"name":"plugin-name"}]}` | customPlugins allows you to mount your own HTTP plugins. |
| customPlugins.enabled | bool | `false` | Whether to configure some custom plugins |
| customPlugins.luaPath | string | `"/opts/custom_plugins/?.lua"` | the lua_path that tells APISIX where it can find plugins, note the last ';' is required. |
| customPlugins.plugins[0] | object | `{"attrs":{},"configMap":{"mounts":[{"key":"the-file-name","path":"mount-path"}],"name":"configmap-name"},"name":"plugin-name"}` | plugin name. |
| customPlugins.plugins[0].attrs | object | `{}` | plugin attrs |
| customPlugins.plugins[0].configMap | object | `{"mounts":[{"key":"the-file-name","path":"mount-path"}],"name":"configmap-name"}` | plugin codes can be saved inside configmap object. |
| customPlugins.plugins[0].configMap.mounts | list | `[{"key":"the-file-name","path":"mount-path"}]` | since keys in configmap is flat, mountPath allows to define the mount path, so that plugin codes can be mounted hierarchically. |
| customPlugins.plugins[0].configMap.name | string | `"configmap-name"` | name of configmap. |
| dashboard.config.conf.etcd.endpoints | list | `["apisix-etcd:2379"]` | Supports defining multiple etcd host addresses for an etcd cluster |
| dashboard.config.conf.etcd.password | string | `nil` | Specifies etcd basic auth password if enable etcd auth |
| dashboard.config.conf.etcd.prefix | string | `"/apisix"` | apisix configurations prefix |
| dashboard.config.conf.etcd.username | string | `nil` | Specifies etcd basic auth username if enable etcd auth |
| dashboard.enabled | bool | `false` |  |
| deployment.certs | object | `{"cert":"","cert_key":"","certsSecret":"","mTLSCACert":"","mTLSCACertSecret":""}` | certs used for certificates in decoupled mode |
| deployment.certs.cert | string | `""` | cert name in certsSecret |
| deployment.certs.cert_key | string | `""` | cert key in certsSecret |
| deployment.certs.certsSecret | string | `""` | secret name used for decoupled mode |
| deployment.certs.mTLSCACert | string | `""` | mTLS CA cert filename in mTLSCACertSecret |
| deployment.certs.mTLSCACertSecret | string | `""` | trusted_ca_cert name in certsSecret |
| deployment.controlPlane | object | `{"cert":"","certKey":"","certsSecret":"","confServerPort":"9280"}` | used for control_plane deployment mode |
| deployment.controlPlane.cert | string | `""` | conf Server CA cert name in certsSecret |
| deployment.controlPlane.certKey | string | `""` | conf Server cert key name in certsSecret |
| deployment.controlPlane.certsSecret | string | `""` | secret name used by conf Server |
| deployment.controlPlane.confServerPort | string | `"9280"` | conf Server address |
| deployment.dataPlane | object | `{"controlPlane":{"host":[],"prefix":"/apisix","timeout":30}}` | used for data_plane deployment mode |
| deployment.dataPlane.controlPlane.host | list | `[]` | The hosts of the control_plane used by the data_plane |
| deployment.dataPlane.controlPlane.prefix | string | `"/apisix"` | The prefix of the control_plane used by the data_plane |
| deployment.dataPlane.controlPlane.timeout | int | `30` | Timeout when the data plane connects to the control plane |
| deployment.mode | string | `"traditional"` | Apache APISIX deployment mode Optional: traditional, decoupled  ref: https://apisix.apache.org/docs/apisix/deployment-modes/ |
| deployment.role | string | `"traditional"` | Deployment role Optional: traditional, data_plane, control_plane  ref: https://apisix.apache.org/docs/apisix/deployment-modes/ |
| discovery.enabled | bool | `false` | Enable or disable Apache APISIX integration service discovery |
| discovery.registry | object | `{}` | Registry is the same to the one in APISIX [config-default.yaml](https://github.com/apache/apisix/blob/master/conf/config-default.yaml#L281), and refer to such file for more setting details. also refer to [this documentation for integration service discovery](https://apisix.apache.org/docs/apisix/discovery) |
| dns.resolvers[0] | string | `"127.0.0.1"` |  |
| dns.resolvers[1] | string | `"172.20.0.10"` |  |
| dns.resolvers[2] | string | `"114.114.114.114"` |  |
| dns.resolvers[3] | string | `"223.5.5.5"` |  |
| dns.resolvers[4] | string | `"1.1.1.1"` |  |
| dns.resolvers[5] | string | `"8.8.8.8"` |  |
| dns.timeout | int | `5` |  |
| dns.validity | int | `30` |  |
| etcd | object | `{"auth":{"rbac":{"create":false,"rootPassword":""},"tls":{"certFilename":"","certKeyFilename":"","enabled":false,"existingSecret":"","sni":"","verify":true}},"enabled":true,"host":["http://etcd.host:2379"],"password":"","prefix":"/apisix","replicaCount":3,"service":{"port":2379},"timeout":30,"user":""}` | etcd configuration use the FQDN address or the IP of the etcd |
| etcd.auth | object | `{"rbac":{"create":false,"rootPassword":""},"tls":{"certFilename":"","certKeyFilename":"","enabled":false,"existingSecret":"","sni":"","verify":true}}` | if etcd.enabled is true, set more values of bitnami/etcd helm chart |
| etcd.auth.rbac.create | bool | `false` | No authentication by default. Switch to enable RBAC authentication |
| etcd.auth.rbac.rootPassword | string | `""` | root password for etcd. Requires etcd.auth.rbac.create to be true. |
| etcd.auth.tls.certFilename | string | `""` | etcd client cert filename using in etcd.auth.tls.existingSecret |
| etcd.auth.tls.certKeyFilename | string | `""` | etcd client cert key filename using in etcd.auth.tls.existingSecret |
| etcd.auth.tls.enabled | bool | `false` | enable etcd client certificate |
| etcd.auth.tls.existingSecret | string | `""` | name of the secret contains etcd client cert |
| etcd.auth.tls.sni | string | `""` | specify the TLS Server Name Indication extension, the ETCD endpoint hostname will be used when this setting is unset. |
| etcd.auth.tls.verify | bool | `true` | whether to verify the etcd endpoint certificate when setup a TLS connection to etcd |
| etcd.enabled | bool | `true` | install etcd(v3) by default, set false if do not want to install etcd(v3) together |
| etcd.host | list | `["http://etcd.host:2379"]` | if etcd.enabled is false, use external etcd, support multiple address, if your etcd cluster enables TLS, please use https scheme, e.g. https://127.0.0.1:2379. |
| etcd.password | string | `""` | if etcd.enabled is false, password for external etcd. If etcd.enabled is true, use etcd.auth.rbac.rootPassword instead. |
| etcd.prefix | string | `"/apisix"` | apisix configurations prefix |
| etcd.timeout | int | `30` | Set the timeout value in seconds for subsequent socket operations from apisix to etcd cluster |
| etcd.user | string | `""` | if etcd.enabled is false, username for external etcd. If etcd.enabled is true, use etcd.auth.rbac.rootPassword instead. |
| extPlugin.cmd | list | `["/path/to/apisix-plugin-runner/runner","run"]` | the command and its arguements to run as a subprocess |
| extPlugin.enabled | bool | `false` | Enable External Plugins. See [external plugin](https://apisix.apache.org/docs/apisix/next/external-plugin/) |
| extraInitContainers | list | `[{"command":["/bin/sh","-c","sysctl -w net.core.somaxconn=65535\nsysctl -w net.ipv4.ip_local_port_range=\"1024 65535\"\nsysctl -w net.ipv4.tcp_max_syn_backlog=8192\nsysctl -w fs.file-max=1048576\nsysctl -w fs.inotify.max_user_instances=16384\nsysctl -w fs.inotify.max_user_watches=524288\nsysctl -w fs.inotify.max_queued_events=16384\n"],"image":"busybox:1.28","name":"init-sysctl","securityContext":{"privileged":true}}]` | Additional `initContainers`, See [Kubernetes initContainers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/) for the detail. |
| extraVolumeMounts | list | `[]` | Additional `volume`, See [Kubernetes Volumes](https://kubernetes.io/docs/concepts/storage/volumes/) for the detail. |
| extraVolumes | list | `[]` | Additional `volume`, See [Kubernetes Volumes](https://kubernetes.io/docs/concepts/storage/volumes/) for the detail. |
| fullnameOverride | string | `""` |  |
| gateway.externalIPs | list | `[]` |  |
| gateway.externalTrafficPolicy | string | `"Cluster"` |  |
| gateway.http | object | `{"additionalContainerPorts":[],"containerPort":9080,"enabled":true,"servicePort":80}` | Apache APISIX service settings for http |
| gateway.http.additionalContainerPorts | list | `[]` | Support multiple http ports, See [Configuration](https://github.com/apache/apisix/blob/0bc65ea9acd726f79f80ae0abd8f50b7eb172e3d/conf/config-default.yaml#L24) |
| gateway.ingress | object | `{"annotations":{},"enabled":false,"hosts":[{"host":"apisix.local","paths":[]}],"tls":[]}` | Using ingress access Apache APISIX service |
| gateway.ingress.annotations | object | `{}` | Ingress annotations |
| gateway.labelsOverride | object | `{}` | Override default labels assigned to Apache APISIX gateway resources |
| gateway.stream | object | `{"enabled":false,"only":false,"tcp":[],"udp":[]}` | Apache APISIX service settings for stream. L4 proxy (TCP/UDP) |
| gateway.tls | object | `{"additionalContainerPorts":[],"certCAFilename":"","containerPort":9443,"enabled":false,"existingCASecret":"","http2":{"enabled":true},"servicePort":443,"sslProtocols":"TLSv1.2 TLSv1.3"}` | Apache APISIX service settings for tls |
| gateway.tls.additionalContainerPorts | list | `[]` | Support multiple https ports, See [Configuration](https://github.com/apache/apisix/blob/0bc65ea9acd726f79f80ae0abd8f50b7eb172e3d/conf/config-default.yaml#L99) |
| gateway.tls.certCAFilename | string | `""` | Filename be used in the gateway.tls.existingCASecret |
| gateway.tls.existingCASecret | string | `""` | Specifies the name of Secret contains trusted CA certificates in the PEM format used to verify the certificate when APISIX needs to do SSL/TLS handshaking with external services (e.g. etcd) |
| gateway.tls.sslProtocols | string | `"TLSv1.2 TLSv1.3"` | TLS protocols allowed to use. |
| gateway.type | string | `"NodePort"` | Apache APISIX service type for user access itself |
| global.imagePullSecrets | list | `[]` | Global Docker registry secret names as an array |
| ingress-controller | object | `{"config":{"apisix":{"adminAPIVersion":"v3"}},"enabled":false}` | Ingress controller configuration |
| initContainer.image | string | `"busybox"` | Init container image |
| initContainer.tag | float | `1.28` | Init container tag |
| logs.accessLog | string | `"/dev/stdout"` | Access log path |
| logs.accessLogFormat | string | `"$remote_addr - $remote_user [$time_local] $http_host \\\"$request\\\" $status $body_bytes_sent $request_time \\\"$http_referer\\\" \\\"$http_user_agent\\\" $upstream_addr $upstream_status $upstream_response_time \\\"$upstream_scheme://$upstream_host$upstream_uri\\\""` | Access log format |
| logs.accessLogFormatEscape | string | `"default"` | Allows setting json or default characters escaping in variables |
| logs.enableAccessLog | bool | `true` | Enable access log or not, default true |
| logs.errorLog | string | `"/dev/stderr"` | Error log path |
| logs.errorLogLevel | string | `"warn"` | Error log level |
| nameOverride | string | `""` |  |
| nginx.enableCPUAffinity | bool | `true` |  |
| nginx.envs | list | `[]` |  |
| nginx.workerConnections | string | `"10620"` |  |
| nginx.workerProcesses | string | `"auto"` |  |
| nginx.workerRlimitNofile | string | `"20480"` |  |
| pluginAttrs | object | `{}` | Set APISIX plugin attributes, see [config-default.yaml](https://github.com/apache/apisix/blob/master/conf/config-default.yaml#L376) for more details |
| plugins | list | `[]` | Customize the list of APISIX plugins to enable. By default, APISIX's default plugins are automatically used. See [config-default.yaml](https://github.com/apache/apisix/blob/master/conf/config-default.yaml) |
| rbac.create | bool | `false` |  |
| serviceAccount.annotations | object | `{}` |  |
| serviceAccount.create | bool | `false` |  |
| serviceAccount.name | string | `""` |  |
| serviceMonitor | object | `{"annotations":{},"containerPort":9091,"enabled":false,"interval":"15s","labels":{},"metricPrefix":"apisix_","name":"","namespace":"","path":"/apisix/prometheus/metrics"}` | Observability configuration. ref: https://apisix.apache.org/docs/apisix/plugins/prometheus/ |
| serviceMonitor.annotations | object | `{}` | @param serviceMonitor.annotations ServiceMonitor annotations |
| serviceMonitor.containerPort | int | `9091` | container port where the metrics are exposed |
| serviceMonitor.enabled | bool | `false` | Enable or disable Apache APISIX serviceMonitor |
| serviceMonitor.interval | string | `"15s"` | interval at which metrics should be scraped |
| serviceMonitor.labels | object | `{}` | @param serviceMonitor.labels ServiceMonitor extra labels |
| serviceMonitor.metricPrefix | string | `"apisix_"` | prefix of the metrics |
| serviceMonitor.name | string | `""` | name of the serviceMonitor, by default, it is the same as the apisix fullname |
| serviceMonitor.namespace | string | `""` | namespace where the serviceMonitor is deployed, by default, it is the same as the namespace of the apisix |
| serviceMonitor.path | string | `"/apisix/prometheus/metrics"` | path of the metrics endpoint |
| stream_plugins | list | `[]` | Customize the list of APISIX stream_plugins to enable. By default, APISIX's default stream_plugins are automatically used. See [config-default.yaml](https://github.com/apache/apisix/blob/master/conf/config-default.yaml) |
| updateStrategy | object | `{}` |  |
| vault.enabled | bool | `false` | Enable or disable the vault integration |
| vault.host | string | `""` | The host address where the vault server is running. |
| vault.prefix | string | `""` | Prefix allows you to better enforcement of policies. |
| vault.timeout | int | `10` | HTTP timeout for each request. |
| vault.token | string | `""` | The generated token from vault instance that can grant access to read data from the vault. |
| wasmPlugins.enabled | bool | `false` | Enable Wasm Plugins. See [wasm plugin](https://apisix.apache.org/docs/apisix/next/wasm/) |
| wasmPlugins.plugins | list | `[]` |  |

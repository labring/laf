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

The following tables lists the configurable parameters of the apisix chart and their default values per section/component:

### Global parameters

| Parameter                 | Description                                     | Default                                                 |
|---------------------------|-------------------------------------------------|---------------------------------------------------------|
| `global.imagePullSecrets` | Global Docker registry secret names as an array | `[]` (does not add image pull secrets to deployed pods) |

### apisix parameters

| Parameter                                         | Description                                                                                                                                                                                                                                                                                                                  | Default                                                |
|---------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `apisix.enabled`                                  | Enable or disable Apache APISIX itself                                                                                                                                                                                                                                                                                       | `true`                                                 |
| `apisix.enableIPv6`                               | Enable nginx IPv6 resolver                                                                                                                                                                                                                                                                                                   | `true`                                                 |
| `apisix.hostNetwork`                              | Use the host's network namespace                                                                                                                                                                                                                                                                                             | `false`                                                |
| `apisix.enableCustomizedConfig`                   | Enable full customized `config.yaml`                                                                                                                                                                                                                                                                                         | `false`                                                |
| `apisix.customizedConfig`                         | If `apisix.enableCustomizedConfig` is true, full customized `config.yaml`. Please note that other settings about APISIX config will be ignored                                                                                                                                                                               | `{}`                                                   |
| `apisix.image.repository`                         | Apache APISIX image repository                                                                                                                                                                                                                                                                                               | `apache/apisix`                                        |
| `apisix.image.tag`                                | Apache APISIX image tag                                                                                                                                                                                                                                                                                                      | `{TAG_NAME}` (the latest Apache APISIX image tag)      |
| `apisix.image.pullPolicy`                         | Apache APISIX image pull policy                                                                                                                                                                                                                                                                                              | `IfNotPresent`                                         |
| `apisix.kind`                                     | Apache APISIX kind use a `DaemonSet` or `Deployment`                                                                                                                                                                                                                                                                         | `Deployment`                                           |
| `apisix.replicaCount`                             | Apache APISIX deploy replica count,kind is DaemonSet,replicaCount not become effective                                                                                                                                                                                                                                       | `1`                                                    |
| `apisix.podAnnotations`                           | Annotations to add to each pod                                                                                                                                                                                                                                                                                               | `{}`                                                   |
| `apisix.priorityClassName`                        | Set [priorityClassName](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/#pod-priority) for Apache APISIX pods                                                                                                                                                                               | `""`                                                   |
| `apisix.podSecurityContext`                       | Set the securityContext for Apache APISIX pods                                                                                                                                                                                                                                                                               | `{}`                                                   |
| `apisix.securityContext`                          | Set the securityContext for Apache APISIX container                                                                                                                                                                                                                                                                          | `{}`                                                   |
| `apisix.podDisruptionBudget.enabled`              | Enable or disable podDisruptionBudget                                                                                                                                                                                                                                                                                        | `false`                                                |
| `apisix.podDisruptionBudget.minAvailable`         | Set the `minAvailable` of podDisruptionBudget. You can specify only one of `maxUnavailable` and `minAvailable` in a single PodDisruptionBudget. See [Specifying a Disruption Budget for your Application](https://kubernetes.io/docs/tasks/run-application/configure-pdb/#specifying-a-poddisruptionbudget) for more details | `Not set` |
| `apisix.podDisruptionBudget.maxUnavailable`       | Set the maxUnavailable of podDisruptionBudget                                                                                                                                                                                                                                                                                | `1`                                                    |
| `apisix.resources`                                | Set pod resource requests & limits                                                                                                                                                                                                                                                                                           | `{}`                                                   |
| `apisix.nodeSelector`                             | Node labels for Apache APISIX pod assignment                                                                                                                                                                                                                                                                                 | `{}`                                                   |
| `apisix.tolerations`                              | List of node taints to tolerate                                                                                                                                                                                                                                                                                              | `{}`                                                   |
| `apisix.affinity`                                 | Set affinity for Apache APISIX deploy                                                                                                                                                                                                                                                                                        | `{}`                                                   |
| `apisix.setIDFromPodUID`                          | Whether to use the Pod UID as the APISIX instance id, see [apache/apisix#5417](https://github.com/apache/apisix/issues/5417) to decide whether you should enable this setting)                                                                                                                                               | `false` |
| `apisix.enableServerTokens`                       | Set the `enable_server_tokens` (Whether the APISIX version number should be shown in Server header)                                                                                                                                                                                                                          | `Not Set`                                              |
| `apisix.customLuaSharedDicts`                     | Add custom [lua_shared_dict](https://github.com/openresty/lua-nginx-module#toc88) settings, click [here](https://github.com/apache/apisix-helm-chart/blob/master/charts/apisix/values.yaml#L27-L30) to learn the format of a shared dict                                                                                     | `[]` |
| `apisix.pluginAttrs`                              | Set APISIX plugin attributes, see [config-default.yaml](https://github.com/apache/apisix/blob/master/conf/config-default.yaml#L376) for more details                                                                                                                                                                         | `{}` |
| `apisix.luaModuleHook.enabled`                    | Whether to add a custom lua module                                                                                                                                                                                                                                                                                           | `false` |
| `apisix.luaModuleHook.luaPath`                    | Configure `LUA_PATH` so that your own lua module codes can be located                                                                                                                                                                                                                                                        | `""` |
| `apisix.luaModuleHook.hookPoint`                  | The entrypoint of your lua module, use Lua require syntax, like `"module.say_hello"`                                                                                                                                                                                                                                         | `""` |
| `apisix.luaModuleHook.configMapRef.name`          | Name of the ConfigMap where the lua module codes store                                                                                                                                                                                                                                                                       | "" |
| `apisix.luaModuleHook.configMapRef.mounts[].key`  | Name of the ConfigMap key, for setting the mapping relationship between ConfigMap key and the lua module code path.                                                                                                                                                                                                          | `""` |
| `apisix.luaModuleHook.configMapRef.mounts[].path` | Filepath of the plugin code, for setting the mapping relationship between ConfigMap key and the lua module code path.                                                                                                                                                                                                        | `""` |
| `apisix.httpRouter`                               | HTTP routing strategy. See [APISIX Router](https://apisix.apache.org/docs/apisix/terminology/router/) for the detail.                                                                                                                                                                                                    | `[]` |
| `extraVolumes`                                    | Additional `volume`, See [Kubernetes Volumes](https://kubernetes.io/docs/concepts/storage/volumes/) for the detail.                                                                                                                                                                                                          | `[]` |
| `extraVolumeMounts`                               | Additional `volumeMounts`, See [Kubernetes Volumes](https://kubernetes.io/docs/concepts/storage/volumes/) for the detail.                                                                                                                                                                                                    | `[]` |
| `extraInitContainers`                             | Additional `initContainers`, See [Kubernetes initContainers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/) for the detail.                                                                                                                                                                                                    | `[]` |

### gateway parameters

Apache APISIX service parameters, this determines how users can access itself.

| Parameter                       | Description                                                                                                                                                                         | Default    |
|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| `gateway.type`                  | Apache APISIX service type for user access itself                                                                                                                                   | `NodePort` |
| `gateway.externalTrafficPolicy` | Setting how the Service route external traffic                                                                                                                                      | `Cluster`  |
| `gateway.http`                  | Apache APISIX service settings for http                                                                                                                                             |            |
| `gateway.tls`                   | Apache APISIX service settings for tls                                                                                                                                              |            |
| `gateway.tls.existingCASecret`  | Specifies the name of Secret contains trusted CA certificates in the PEM format used to verify the certificate when APISIX needs to do SSL/TLS handshaking with external services (e.g. etcd) | `""`       |
| `gateway.tls.certCAFilename`    | Filename be used in the `gateway.tls.existingCASecret`                                                                                                                                          | `""`       |
| `gateway.tls.sslProtocols`    |   TLS protocols allowed to use.  | `"TLSv1.2 TLSv1.3"`       |
| `gateway.stream`                | Apache APISIX service settings for stream                                                                                                                                           |            |
| `gateway.ingress`               | Using ingress access Apache APISIX service                                                                                                                                          |            |
| `gateway.ingress.annotations`   | Ingress annotations                                                                                                                                                                 | `[]`       |
| `gateway.ingress.className`     | `ingressClassName` replaces `annotations kubernetes.io/ingress.class`, required Kubernetes `>=1.18`                                                                                   |            |

### admin parameters

| Parameter                  | Description                                                                      | Default                                                 |
|----------------------------|----------------------------------------------------------------------------------|---------------------------------------------------------|
| `admin.enabled`            | Enable or disable Apache APISIX admin API                                        | `true`                                                  |
| `admin.port`               | which port to use for Apache APISIX admin API                                    | `9180`                                                  |
| `admin.servicePort`        | Service port to use for Apache APISIX admin API                                  | `9180`                                                  |
| `admin.type`               | Apache APISIX admin API service type                                             | `ClusterIP`                                             |
| `admin.externalIPs`        | IPs for which nodes in the cluster will also accept traffic for the servic       | `[]`                                                    |
| `admin.cors`               | Apache APISIX admin API support CORS response headers                            | `true`                                                  |
| `admin.credentials.admin`  | Apache APISIX admin API admin role credentials                                   | `edd1c9f034335f136f87ad84b625c8f1`                      |
| `admin.credentials.viewer` | Apache APISIX admin API viewer role credentials                                  | `4054f7cf07e344346cd3f287985e76a2`                      |
| `admin.allow.ipList`       | The client IP CIDR allowed to access Apache APISIX Admin API service             | `["127.0.0.1/24"]`                                      |

### custom configuration snippet parameters

| Parameter                        | Description                                                                                        | Default |
|----------------------------------|----------------------------------------------------------------------------------------------------|---------|
| `configurationSnippet.main`      | Add custom Nginx configuration (main block) to nginx.conf                                          | `{}`    |
| `configurationSnippet.httpStart` | Add custom Nginx configuration (http block) to nginx.conf                                          | `{}`    |
| `configurationSnippet.httpEnd`   | Add custom Nginx configuration (http block) to nginx.conf, will be put at the bottom of http block | `{}`    |
| `configurationSnippet.httpSrv`   | Add custom Nginx configuration (server block) to nginx.conf                                        | `{}`    |
| `configurationSnippet.httpAdmin` | Add custom Nginx configuration (Admin API server block) to nginx.conf                              | `{}`    |
| `configurationSnippet.stream`    | Add custom Nginx configuration (stream block) to nginx.conf                                        | `{}`    |

### etcd parameters

| Parameter                       | Description                                                                                                                                                      | Default                     |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| `etcd.enabled`                  | use built-in etcd                                                                                                                                                | `true`                      |
| `etcd.host`                     | if `etcd.enabled` is false, use external etcd, support multiple address, if your etcd cluster enables TLS, please use https scheme, e.g. https://127.0.0.1:2379. | `["http://etcd.host:2379"]` |
| `etcd.prefix`                   | apisix configurations prefix                                                                                                                                     | `/apisix`                   |
| `etcd.timeout`                  | Set the timeout value in seconds for subsequent socket operations from apisix to etcd cluster                                                                    | `30`                        |
| `etcd.auth.rbac.create`        | Switch to enable RBAC authentication                                                                                                                                             | `false`                     |
| `etcd.auth.rbac.user`           | root username for etcd                                                                                                                                           | `""`                        |
| `etcd.auth.rbac.password`       | root password for etcd                                                                                                                                           | `""`                        |
| `etcd.auth.tls.enabled`         | enable etcd client certificate                                                                                                                                   | `false`                     |
| `etcd.auth.tls.existingSecret`  | name of the secret contains etcd client cert                                                                                                                     | `""`                        |
| `etcd.auth.tls.certFilename`    | etcd client cert filename using in `etcd.auth.tls.existingSecret`                                                                                                | `""`                        |
| `etcd.auth.tls.certKeyFilename` | etcd client cert key filename using in `etcd.auth.tls.existingSecret`                                                                                            | `""`                        |
| `etcd.auth.tls.verify`          | whether to verify the etcd endpoint certificate when setup a TLS connection to etcd                                                                              | `true`                      |
| `etcd.auth.tls.sni`            | specify the TLS [Server Name Indication](https://en.wikipedia.org/wiki/Server_Name_Indication) extension,  the ETCD endpoint hostname will be used when this setting is unset. | `""` |

If etcd.enabled is true, set more values of bitnami/etcd helm chart use etcd as prefix.

### plugins and stream_plugins parameters

Default enabled plugins. See [configmap template](https://github.com/apache/apisix-helm-chart/blob/master/charts/apisix/templates/configmap.yaml) for details.


### external plugin parameters

| Parameter                       | Description                                                                                                                                                      | Default                     |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| `extPlugin.enabled` | Enable External Plugins. See [external plugin](https://apisix.apache.org/docs/apisix/next/external-plugin/) | `false` |
| `extPlugin.cmd` | the command and its arguements to run as a subprocess | `{}` |

### wasm plugin parameters

| Parameter                       | Description                                                                                                                                                      | Default                     |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| `wasmPlugins.enabled` | Enable Wasm Plugins. See [wasm plugin](https://apisix.apache.org/docs/apisix/next/wasm/) | `false` |
| `wasmPlugins.plugins[].name` | Set wasm plugin name | `""` |
| `wasmPlugins.plugins[].priority` | Set wasm plugin priority | `7999` |
| `wasmPlugins.plugins[].file` | Set path to wasm plugin | `""` |
| `wasmPlugins.plugins[].http_request_phase` | Set which http request phase for the plugin to run in | `access` |

Note:
  - the easiest way to include your wasm custom plugin is to rebuild the apisix image with those custom plugins included within the directory you define and later on gets referenced to `wasmPlugins.plugins[].file`
  - otherwise you could use `extraVolumes` and `extraVolumeMounts` option to include your plugin by creating your plugin via `ConfigMap` and mount it to apisix pod like example below
    ```
    #... more options omitted ...
    ingress-controller:
      enabled: true

    dashboard:
      enabled: true

    # assuming you install apisix in `apisix` namespace,
    # create the plugin by this command and had the wasm plugin
    # kubectl create configmap --namespace apisix --from-file=./wasm_plugin_x.wasm wasm-plugin-x
    # Note: there are also size limitation on `ConfigMap`

    # these options are kubernetes
    # Volume and VolumeMount api objects
    extraVolumes:
    - name: wasm-plugin-x
      configMap:
        name: wasm-plugin-x
        items:
        - key: wasm_plugin_x.wasm
          path: wasm_plugin_x.wasm
    extraVolumeMounts:
    - name: wasm-plugin-x
      mountPath: /var/local/wasm-plugins/ # later on reference to `wasmPlugins.plugins[].file` as its value
      readOnly: true
    #... more options omitted ...
    ```

### custom plugin parameters

| Parameter                       | Description                                                                                                                                                      | Default                     |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| `apisix.customPlugins.enabled` | Whether to configure some custom plugins | `false` |
| `apisix.customPlugins.luaPath` | Configure `LUA_PATH` so that custom plugin codes can be located | `""` |
| `apisix.customPlugins.plugins[].name` | Custom plugin name | `""` |
| `apisix.customPlugins.plugins[].attrs` | Custom plugin attributes | `{}` |
| `apisix.customPlugins.plugins[].configMap.name` | Name of the ConfigMap where the plugin codes store | `""` |
| `apisix.customPlugins.plugins[].configMap.mounts[].key` | Name of the ConfigMap key, for setting the mapping relationship between ConfigMap key and the plugin code path. | `""` |
| `apisix.customPlugins.plugins[].configMap.mounts[].path` | Filepath of the plugin code, for setting the mapping relationship between ConfigMap key and the plugin code path. | `""` |

### discovery parameters

| Parameter                       | Description                                                                                                                                                                         | Default    |
|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| `discovery.enabled`                  | Enable or disable Apache APISIX integration service discovery | `false` |
| `discovery.registry`                  | Registry is the same to the one in APISIX [config-default.yaml](https://github.com/apache/apisix/blob/master/conf/config-default.yaml#L281), and refer to such file for more setting details. also refer to [this documentation for integration service discovery](https://apisix.apache.org/docs/apisix/discovery) | nil |

If you have enabled this feature,  here is an example:

```yaml
discovery:
  enabled: true
  registry:
    eureka:
      host:
        - "http://${username}:${password}@${eureka_host1}:${eureka_port1}"
        - "http://${username}:${password}@${eureka_host2}:${eureka_port2}"
      prefix: "/eureka/"
      fetch_interval: 30
      weight: 100
      timeout:
        connect: 2000
        send: 2000
        read: 5000
```

### logs parameters

| Parameter                       | Description                                                                                                                                                                         | Default    |
|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| `logs.enableAccessLog`                  | Enable access log or not, default true | `true` |
| `logs.accessLog`                  | Access log path | `/dev/stdout` |
| `logs.accessLogFormat`                  | Access log format | `$remote_addr - $remote_user [$time_local] $http_host \"$request\" $status $body_bytes_sent $request_time \"$http_referer\" \"$http_user_agent\" $upstream_addr $upstream_status $upstream_response_time \"$upstream_scheme://$upstream_host$upstream_uri\"` |
| `logs.accessLogFormatEscape`                  | Allows setting json or default characters escaping in variables | `default` |
| `logs.errorLog`                  | Error log path | `/dev/stderr` |
| `logs.errorLogLevel`                  | Error log level | `warn` |

### dashboard parameters

Configurations for apisix-dashboard sub chart.

### ingress-controller parameters

Configurations for Apache APISIX ingress-controller sub chart.

### serviceMonitor parameters

| Parameter                      | Description                                                  | Default                      |
| ------------------------------ | ------------------------------------------------------------ | ---------------------------- |
| `serviceMonitor.enabled`       | Enable or disable Apache APISIX serviceMonitor               | `false`                      |
| `serviceMonitor.namespace`     | Namespace where the serviceMonitor is deployed               | `""`                         |
| `serviceMonitor.interval`      | Interval at which metrics should be scraped                  | `15s`                        |
| `serviceMonitor.path`          | Path of the Prometheus metrics endpoint                      | `/apisix/prometheus/metrics` |
| `serviceMonitor.containerPort` | Container port which Prometheus metrics are exposed          | `9091`                       |
| `serviceMonitor.labels`        | ServiceMonitor extra labels                                  | `{}`                         |
| `serviceMonitor.annotations`   | ServiceMonitor annotations                                   | `{}`                         |

### initContainers parameters

| Parameter                      | Description          | Default   |
|--------------------------------|----------------------|-----------|
| `initContainer.image`          | Init container image | `busybox` |
| `initContainer.tag`            | Init container tag   | `1.28`    |

### vault integration parameters

| Parameter                  | Description                                                                                      | Default                                                 |
|----------------------------|--------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| `vault.enabled`            | Enable or disable the vault integration                                                          | `false`                                                 |
| `vault.host`               | The host address where the vault server is running.                                              |                                                         |
| `vault.timeout`            | HTTP timeout for each request.                                                                   |                                                         |
| `vault.token`              | The generated token from vault instance that can grant access to read data from the vault.       |                                                         |
| `vault.prefix`             | Prefix allows you to better enforcement of policies.                                             |                                                         |


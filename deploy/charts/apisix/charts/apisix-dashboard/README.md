# Apache APISIX Dashboard

[APISIX Dashboard](https://github.com/apache/apisix-dashboard/) is designed to make it as easy as possible for users to operate Apache APISIX through a frontend interface.

This chart bootstraps an apisix-dashboard deployment on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

APISIX Dashboard requires Kubernetes version 1.14+.

## Get Repo Info

```console
helm repo add apisix https://charts.apiseven.com
helm repo update
```

## Install Chart

**Important:** only helm3 is supported

```console
helm install [RELEASE_NAME] apisix/apisix-dashboard --namespace ingress-apisix --create-namespace
```

The command deploys apisix-dashboard on the Kubernetes cluster in the default configuration.

_See [configuration](#configuration) below._

_See [helm install](https://helm.sh/docs/helm/helm_install/) for command documentation._

## Uninstall Chart

```console
helm uninstall [RELEASE_NAME] --namespace ingress-apisix
```

This removes all the Kubernetes components associated with the chart and deletes the release.

_See [helm uninstall](https://helm.sh/docs/helm/helm_uninstall/) for command documentation._

## Upgrading Chart

```console
helm upgrade [RELEASE_NAME] [CHART] --install
```

_See [helm upgrade](https://helm.sh/docs/helm/helm_upgrade/) for command documentation._

## Parameters

The following tables lists the configurable parameters of the apisix-dashboard chart and their default values per section/component:

### Common parameters

| Name               | Description                                                                                       | Value                    |
| ------------------ | ------------------------------------------------------------------------------------------------- | ------------------------ |
| `nameOverride`     | String to partially override apisix-dashboard.fullname template (will maintain the release name)  | `nil`                    |
| `fullnameOverride` | String to fully override apisix-dashboard.fullname template                                       | `nil`                    |
| `imagePullSecrets` | Docker registry secret names as an array                                                          | `[]`                     |
| `image.repository` | Apache APISIX Dashboard image repository                                                          | `apache/apisix-dashboard`|
| `image.tag`        | Apache APISIX Dashboard image tag (immutable tags are recommended)                                | `2.10.1-alpine`          |
| `image.pullPolicy` | Apache APISIX Dashboard image pull policy                                                         | `IfNotPresent`           |

### Apache APISIX Dashboard configurable parameters

| Name                                 | Description                                                                               | Value           |
| ------------------------------------ | ----------------------------------------------------------------------------------------- | --------------- |
| `config.conf.listen.host`                       | The address on which the `Manager API` should listen. The default value is 0.0.0.0, if want to specify, please enable it. This value accepts IPv4, IPv6, and hostname.                                                                   | `0.0.0.0`             |
| `config.conf.listen.port`                       | The port on which the `Manager API` should listen.                                                                  | `9000`             |
| `config.authentication.secert`                  | Secret for jwt token generation | `secert` |
| `config.authentication.expireTime`                  | JWT token expire time, in second | `3600` |
| `config.authentication.users`                  | Specifies username and password for login `manager api`. | `[{username: admin, password: admin}]` |
| `config.conf.etcd.endpoints`                       | Supports defining multiple etcd host addresses for an etcd cluster                                                                  | `apisix-etcd:2379`             |
| `config.conf.etcd.prefix`                       | Apache APISIX config's prefix in etcd, /apisix by default                                                                  | `/apisix`             |
| `config.conf.etcd.username`                       | Specifies etcd basic auth username if  enable etcd auth                                                                | `~`             |
| `config.conf.etcd.password`                       | Specifies etcd basic auth password  if  enable etcd auth                                                              | `~`             |
| `config.conf.log.accessLog.filePath`                  | Access log path | `/dev/stdout` |
| `config.conf.log.errorLog.filePath`                  | Error log path | `/dev/stderr` |
| `config.conf.log.errorLog.level`                  | Error log level. Supports levels, lower to higher: debug, info, warn, error, panic, fatal | `warn` |

### Deployment parameters

| Name                                            | Description                                                                               | Value           |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------- |
| `replicaCount`                                  | Number of Apache APISIX Dashboard nodes                                                   | `1`             |
| `podAnnotations`                                | Apache APISIX Dashboard Pod annotations                                                   | `{}`            |
| `nodeSelector`                                  | Node labels for pod assignment                                                            | `{}`            |
| `tolerations`                                   | Tolerations for pod assignment                                                            | `[]`            |
| `resources.limits`                              | The resources limits for Apache APISIX Dashboard containers                               | `{}`            |
| `resources.requests`                            | The requested resources for Apache APISIX Dashboardcontainers                             | `{}`            |
| `podSecurityContext`                            | Set the securityContext for Apache APISIX Dashboard pods                                  | `{}`            |
| `securityContext`                               | Set the securityContext for Apache APISIX Dashboard container                             | `{}`            |
| `autoscaling.enabled`                           | Enable autoscaling for Apache APISIX Dashboard deployment                                 | `false`         |
| `autoscaling.minReplicas`                       | Minimum number of replicas to scale back                                                  | `1`             |
| `autoscaling.maxReplicas`                       | Maximum number of replicas to scale out                                                   | `100`           |
| `autoscaling.targetCPUUtilizationPercentage`    | Target CPU utilization percentage                                                         | `80`            |
| `autoscaling.targetMemoryUtilizationPercentage` | Target Memory utilization percentage                                                      | `nil`           |

### Traffic Exposure parameters

| Name                            | Description                                                                                      | Value       |
| ------------------------------- |--------------------------------------------------------------------------------------------------|-------------|
| `service.type`                  | Service type                                                                                     | `ClusterIP` |
| `service.port`                  | Service HTTP port                                                                                | `80`        |
| `ingress.enabled`               | Set to true to enable ingress record generation                                                  | `false`     |
| `ingress.annotations`           | Ingress annotations                                                                              | `{}`        |
| `ingress.hosts`                 | The list of hostnames to be covered with this ingress record.                                    | `[]`        |
| `ingress.tls`                   | Create TLS Secret                                                                                | `false`     |
| `ingress.className`             | `ingressClassName` replace `annotations kubernetes.io/ingress.class`, required kubernetes 1.18>= | `apisix`    |

### RBAC parameters

| Name                         | Description                                                                                                           | Value  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------ |
| `serviceAccount.create`      | Specifies whether a ServiceAccount should be created                                                                  | `true` |
| `serviceAccount.name`        | The name of the ServiceAccount to use. If not set and create is true, a name is generated using the fullname template | `nil`  |
| `serviceAccount.annotations` | Annotations to add to the ServiceAccount Metadata                                                                     | `{}`   |

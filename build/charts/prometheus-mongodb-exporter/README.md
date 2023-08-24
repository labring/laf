# Prometheus MongoDB Exporter

A Prometheus exporter for [MongoDB](https://www.mongodb.com/) metrics.

Installs the [MongoDB Exporter](https://github.com/percona/mongodb_exporter) for [Prometheus](https://prometheus.io/). The
MongoDB Exporter collects and exports oplog, replica set, server status, sharding and storage engine metrics.

## Get Repository Info

```console
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

_See [`helm repo`](https://helm.sh/docs/helm/helm_repo/) for command documentation._

## Install Chart

```console
helm install [RELEASE_NAME] prometheus-community/prometheus-mongodb-exporter
```

_See [configuration](#configuration) below._

_See [helm install](https://helm.sh/docs/helm/helm_install/) for command documentation._

## Uninstall Chart

```console
helm uninstall [RELEASE_NAME]
```

This removes all the Kubernetes components associated with the chart and deletes the release.

_See [helm uninstall](https://helm.sh/docs/helm/helm_uninstall/) for command documentation._

## Upgrading Chart

```console
helm upgrade [RELEASE_NAME] [CHART] --install
```

_See [helm upgrade](https://helm.sh/docs/helm/helm_upgrade/) for command documentation._

### Upgrading an existing Release to a new major version

A major chart version change (like v1.2.3 -> v2.0.0) indicates that there is an incompatible breaking change needing manual actions.

#### From 2.x to 3.x

This version uses the original percona/mongodb_exporter docker image again, as described in the readme and Chart.yaml. It's maintained and it uses frequent docker builds, so this is preferable for security reasons.

The commnad arguments of the exporter have changed. If you have custom `extraArgs` settings you have to adjust them. Because of the newer version of the exporter image metrics may varry though, so you might need to adjust your dashboard querries or try out the "--compatible-mode" parameter in `extraArgs`.

The `mongodb.uri` variable got "mongodb://monogdb:27017" as default parameter.

Chart API was raisded to v2, so Helm 2 is not supported anymore.

The servicemonitor has been disabled by default as prometheus operator might not be installed in cluster.

## Configuration

See [Customizing the Chart Before Installing](https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing). To see all configurable options with detailed comments, visit the chart's [values.yaml](./values.yaml), or run these configuration commands:

```console
helm show values prometheus-community/prometheus-mongodb-exporter
```

### MongoDB Server Connection

To use the chart, ensure the `mongodb.uri` is populated with a valid [MongoDB URI](https://docs.mongodb.com/manual/reference/connection-string) or an existing secret (in the releases namespace) containing the key defined on `existingSecret.key`, with the URI is referred via `existingSecret.name`. If no secret key is defined, the default value is `mongodb-uri`.

If the MongoDB server requires authentication, credentials should be populated in the connection string as well. The MongoDB Exporter supports connecting to either a MongoDB replica set member, shard, or standalone instance.

### Service Monitor

The chart comes with a ServiceMonitor for use with the [Prometheus Operator](https://github.com/helm/charts/tree/master/stable/prometheus-operator). By default, the ServiceMonitor is disabled. You can enable the ServiceMonitor by setting `serviceMonitor.enabled` to `true`. For the ServiceMonitor to be detected by the Prometheus Operator, you must add the selector label to `serviceMonitor.additionalLabels`. You can find this label under `spec.serviceMonitorSelector` of the Prometheus CRD.

If you're not using the Prometheus Operator, you can instead populate the `podAnnotations` as below:

```yaml
podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "metrics"
```

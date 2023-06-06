# Apache APISIX ingress controller

[APISIX Ingress controller](https://github.com/apache/apisix-ingress-controller/) for Kubernetes using Apache APISIX as a high performance reverse proxy and load balancer.

If you have installed multiple ingress controller, add the `kubernetes.io/ingress.class: apisix` annotation to your Ingress resources.

This chart bootstraps an apisix-ingress-controller deployment on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

Apisix ingress controller requires Kubernetes version 1.16+.

## Get Repo Info

```console
helm repo add apisix https://charts.apiseven.com
helm repo update
```

## Install Chart

**Important:** only helm3 is supported

```console
helm install [RELEASE_NAME] apisix/apisix-ingress-controller --namespace ingress-apisix --create-namespace
```

The command deploys apisix-ingress-controller on the Kubernetes cluster in the default configuration.

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

## Configuration

See [Customizing the Chart Before Installing](https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing). To see all configurable options with detailed comments, visit the chart's [values.yaml](./values.yaml), or run these configuration commands:

```console
helm show values apisix/apisix-ingress-controller
```

### Security context

A security context provides us with a way to define privilege and access control for a Pod or even at the container level.

Check [here](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#securitycontext-v1-core) to see the SecurityContext resource with more detail.

Check also [here](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/) to see a full explanation and some examples to configure the security context.

Right below you have an example of the security context configuration. In this case, we define that all the processes in the container will run with user ID 1000.

```yaml
...

spec:
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
...
```

The same for the group definition, where we define the primary group of 3000 for all processes.

**It's quite important to know, if the `runAsGroup` is omited, the primary group will be root(0)**, which in some cases goes against some security policies.

To define this configuration at the **pod level**, you need to set:

```yaml
    --set podSecurityContext.runAsUser=«VALUE»
    --set podSecurityContext.runAsGroup=«VALUE»
    ...
```

The same for container level, you need to set:

```yaml
    --set securityContext.runAsUser=«VALUE»
    --set SecurityContext.runAsGroup=«VALUE»
    ...
```

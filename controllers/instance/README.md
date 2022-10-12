# instance

Instance is a Kubernetes controller that manages the lifecycle of an app instance.

When an instance is created, the instance controller is responsible for creating its corresponding deployment (pod & containers) in the specified cluster.

## Terms

- `instance` 
  - is a crd that represents an app instance resource (deployment / pod / containers)
  - is created by the application controller while the application state is desired to be `Running`
  - is deleted by the application controller while the application state is desired to be `Stopped`
  - is created in the same namespace as the application
  - is created with the same name as the application
  - is associated with the application based on appid
  - must be created in the corresponding cluster that associated with same region as the application
  - manages the lifecycle of the deployment / pod / containers of the application

- `cluster`
  - is a crd that represents a kubernetes cluster
  - must be a cluster accessible in the instance controller
  - provides the necessary information for accessing the cluster, including the kubeconfig of the cluster, etc.
  - can only hold instances that are associated with the same region

## Scenario

- application controller will create an instance when a application is desired to be `Running`.
- application controller will delete an instance when a application is desired to be `Stopped`.
- The instance controller needs to select a suitable cluster according to the instance's region.
- The instance controller needs to obtain the app's runtime & bundle configuration based on the instance's appid to create the deployment(pod & containers).

## Work Flow

- The application controller creates an instance when an application is desired to be `Running`.
  1. The instance controller selects a suitable cluster according to the instance's region.
  2. The instance controller obtains the app's runtime & bundle configuration based on the instance's appid to create the deployment(pod & containers).
  3. The instance controller connects to the cluster and creates the deployment with the runtime & bundle configuration obtained in step 3.
  4. The instance controller marks the instance's `created condition` to `true` when the deployment is created successfully.
  5. The instance controller marks the instance's `ready condition` to `true` when the deployment is ready.

- The application controller deletes an instance when an application is desired to be `Stopped`.
  1. The instance controller connects to the cluster and deletes the deployment.
  2. The instance controller marks the instance's `created condition` to `false` when the deployment is deleted successfully.
  3. The instance controller marks the instance's `ready condition` to `false` when the deployment is deleted successfully.
  4. The instance controller deletes the instance.

## In Future

- Instance may support scaling in the future.

## Getting Started

You’ll need a Kubernetes cluster to run against. You can use [KIND](https://sigs.k8s.io/kind) to get a local cluster for testing, or run against a remote cluster.
**Note:** Your controller will automatically use the current context in your kubeconfig file (i.e. whatever cluster `kubectl cluster-info` shows).

### Running on the cluster

1. Install Instances of Custom Resources:

```sh
kubectl apply -f config/samples/
```

2. Build and push your image to the location specified by `IMG`:

```sh
make docker-build docker-push IMG=<some-registry>/instance:tag
```

3. Deploy the controller to the cluster with the image specified by `IMG`:

```sh
make deploy IMG=<some-registry>/instance:tag
```

### Uninstall CRDs

To delete the CRDs from the cluster:

```sh
make uninstall
```

### Undeploy controller

UnDeploy the controller to the cluster:

```sh
make undeploy
```

## Contributing

// TODO(user): Add detailed information on how you would like others to contribute to this project

### How it works

This project aims to follow the Kubernetes [Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)

It uses [Controllers](https://kubernetes.io/docs/concepts/architecture/controller/)
which provides a reconcile function responsible for synchronizing resources untile the desired state is reached on the cluster

### Test It Out

1. Install the CRDs into the cluster:

```sh
make install
```

2. Run your controller (this will run in the foreground, so switch to a new terminal if you want to leave it running):

```sh
make run
```

**NOTE:** You can also run this in one step by running: `make install run`

### Modifying the API definitions

If you are editing the API definitions, generate the manifests such as CRs or CRDs using:

```sh
make manifests
```

**NOTE:** Run `make --help` for more information on all potential `make` targets

More information can be found via the [Kubebuilder Documentation](https://book.kubebuilder.io/introduction.html)

## License

Copyright 2022.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

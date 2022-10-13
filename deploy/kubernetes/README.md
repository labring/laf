
## Run laf on kubernetes cluster

> WARNING: Mongodb & MinIO are running without PVC in this sample, you SHOULD config your own MongoDb & MinIO cluster with PVC. 

> Edit `config.yml` to config your laf cluster first.

> You should install [`helm`](https://helm.sh/) first.

```sh
# install ingress-nginx
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx

# run laf cluster
kubectl apply -f .
```


## Trouble shooting

> If ingress-nginx-controller is not listening on port 80 on your host machine,
please refer to [`this link`](https://github.com/kubernetes/ingress-nginx/issues/4799#issuecomment-560406420).

> Please do re-apply with `ingress.yaml` by kubectl after modifying config of ingress-nginx-controller for every once.

> TODO
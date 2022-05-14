
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

> TODO

## Run laf on kubernetes cluster

> Mongodb is NOT provided, your should config a mongodb server for it before run laf cluster. 

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
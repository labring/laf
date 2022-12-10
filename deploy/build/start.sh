kubectl create namespace laf-system || true
kubectl apply -f manifests/

echo "DOMAIN: $DOMAIN"

helm install laf -n laf-system \
    --set minio.persistence.size=5Gi \
    --set mongodb.storage.size=5Gi \
    --set gateway.http.containerPort=80 \
    --set gateway.tls.containerPort=443 \
    --set apisix.kind=DaemonSet \
    --set apisix.hostNetwork=true \
    --set global.domain=${DOMAIN} \
    ./charts/laf
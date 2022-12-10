kubectl create namespace laf-system || true
kubectl apply -f manifests/

echo "DOMAIN: $DOMAIN"

helm install laf -n laf-system \
    --set minio.persistence.size=${OSS_PV_SIZE} \
    --set mongodb.storage.size=${DB_PV_SIZE} \
    --set global.domain=${DOMAIN} \
    --set global.region=${REGION} \
    ./charts/laf
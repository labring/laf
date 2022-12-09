kubectl create namespace laf-system || true
kubectl apply -f manifests/

helm install laf -n laf-system --set minio.persistence.size=1Gi --set mongodb.storage.size=1Gi ./charts/laf

```bash
kubectl create namespace laf-system || true

helm install laf -n laf-system --wait \
  --set minio.persistence.size=1Gi \
  --set mongodb.storage.size=1Gi \
  .

# uninstall
helm uninstall laf -n laf-system
```
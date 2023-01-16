
# get server pod name
POD_NAME=$(kubectl get pods --namespace laf-system -l "app.kubernetes.io/name=laf-server,app.kubernetes.io/instance=server" -o jsonpath="{.items[0].metadata.name}")

# kubectl exec to get the pod env
kubectl exec -it ${POD_NAME} -n laf-system -- env > .env

# remove MINIO_CLIENT_PATH line
sed -i '' '/MINIO_CLIENT_PATH/d' .env

# replace 'mongo.laf-system.svc.cluster.local' with '127.0.0.1'
sed -i '' 's/mongo.laf-system.svc.cluster.local/127.0.0.1/g' .env

# replace 'w=majority' with 'w=majority&directConnection=true'
sed -i '' 's/w=majority/w=majority\&directConnection=true/g' .env

# remove MINIO_CLIENT_PATH line
sed -i '' '/MINIO_CLIENT_PATH/d' .env

# replace 'mongo.laf-system.svc.cluster.local' with '127.0.0.1'
sed -i '' 's/mongodb-0.mongo.laf-system.svc.cluster.local/127.0.0.1/g' .env

# replace 'w=majority' with 'w=majority&directConnection=true'
sed -i '' 's/w=majority/w=majority\&directConnection=true/g' .env

# port forward mongo
kubectl port-forward mongodb-0 27017:27017 -n laf-system
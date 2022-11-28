
# Install laf controllers
sealos run lafyun/laf-controllers:dev

# Install others required components

kubectl create namespace laf || true

SCRIPT_DIR=$(dirname "$0")
CHARTS_DIR=$SCRIPT_DIR/../charts

# Install postgresql
PG_HOST=postgresql
PG_USERNAME=adm1n
PG_PASSWORD=passw0rd
PG_DATABASE=casdoor
helm install postgresql \
  --set service.name=$PG_HOST \
  --set username=$PG_USERNAME \
  --set password=$PG_PASSWORD \
  --set database=$PG_DATABASE \
  --namespace laf \
  $CHARTS_DIR/postgresql

# Install casdoor 
NODE_IP=$(kubectl get nodes -o jsonpath="{.items[0].status.addresses[0].address}")
CASDOOR_NODE_PORT=30070
CASDOOR_ENDPOINT=http://$NODE_IP:$CASDOOR_NODE_PORT
CASDOOR_REDIRECT_URI=http://localhost:3001/login_callback
helm install casdoor \
  --set service.nodePort=$CASDOOR_NODE_PORT \
  --set postgresql.host=$PG_HOST \
  --set postgresql.username=$PG_USERNAME \
  --set postgresql.password=$PG_PASSWORD \
  --set postgresql.database=$PG_DATABASE \
  --set init.redirect_uri=$CASDOOR_REDIRECT_URI \
  --namespace laf \
  $CHARTS_DIR/casdoor

# Install MongoDb
MONGO_ROOT_USER=admin
MONOG_ROOT_PASS=passw0rd
helm install mongodb \
  --set db.username=$MONGO_ROOT_USER \
  --set db.password=$MONOG_ROOT_PASS \
  --set db.replicaSetName=rs0 \
  --namespace laf \
  $CHARTS_DIR/mongodb

# Install MinIO
MINIO_ROOT_USER=minio-root
MINIO_ROOT_PASS=passw0rd
helm repo add minio https://charts.min.io/
helm install minio \
    --set rootUser=$MINIO_ROOT_USER,rootPassword=$MINIO_ROOT_PASS \
    --set replicas=1 --set resources.requests.memory=100Mi --set drivesPerNode=4 \
    --set persistence.enabled=true --set persistence.storageClass=local-hostpath --set persistence.size=1Gi \
    --namespace laf \
    minio/minio

# Install etcd
helm install etcd --namespace laf  $CHARTS_DIR/etcd

# Install APISIX
helm install apisix \
  --set etcd.enabled=false  \
  --set etcd.host={http://etcd:2379} \
  --set etcd.prefix=/apisix \
  --namespace laf \
  $CHARTS_DIR/apisix


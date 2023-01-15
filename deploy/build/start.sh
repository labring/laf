
echo "DOMAIN: $DOMAIN"

# check $DOMAIN is available
if ! host $DOMAIN; then
    echo "Domain $DOMAIN is not available"
    exit 1
fi

# *************** Environment Variables ************** #

## envs - global
HTTP_SCHEMA=${HTTP_SCHEMA:-http}
REGION=${REGION:-default}
NAMESPACE=${NAMESPACE:-laf-system}

## envs - mongodb
DB_USERNAME=admin
DB_PASSWORD=$(tr -cd 'a-z0-9' </dev/urandom |head -c64)
DATABASE_URL=mongodb://${DB_USERNAME}:${DB_PASSWORD}@mongo.${NAMESPACE}.svc.cluster.local:27017/sys_db?authSource=admin&replicaSet=rs0&w=majority

## envs - minio
MINIO_ROOT_ACCESS_KEY=$(tr -cd 'a-z0-9' </dev/urandom |head -c16)
MINIO_ROOT_SECRET_KEY=$(tr -cd 'a-z0-9' </dev/urandom |head -c64)
MINIO_EXTERNAL_ENDPOINT=${HTTP_SCHEMA}://oss.${DOMAIN}
MINIO_INTERNAL_ENDPOINT=laf-minio.${NAMESPACE}.svc.cluster.local:9000
MINIO_DOMAIN=oss.${DOMAIN}

## envs - apisix
APISIX_API_URL=http://apisix-admin.${NAMESPACE}.svc.cluster.local:9180/apisix/admin
APISIX_API_KEY=$(tr -cd 'a-z0-9' </dev/urandom |head -c64)

## envs - casdoor
CASDOOR_ENDPOINT=${HTTP_SCHEMA}://casdoor.${DOMAIN}
CASDOOR_CLIENT_ID=$(tr -cd 'a-f0-9' </dev/urandom |head -c21)
CASDOOR_CLIENT_SECRET=$(tr -cd 'a-f0-9' </dev/urandom |head -c64)
CASDOOR_REDIRECT_URI=${HTTP_SCHEMA}://www.${DOMAIN}/login_callback


# *************** Deployments **************** #

## 0. create namespace
kubectl create namespace ${NAMESPACE} || true
kubectl apply -f manifests/

## 1. install mongodb
helm install mongodb -n ${NAMESPACE} \
    --set db.username=${DB_USERNAME} \
    --set db.password=${DB_PASSWORD} \
    --set storage.size=${DB_PV_SIZE} \
    ./charts/mongodb


## 2. install minio
helm install minio -n ${NAMESPACE} \
    --set rootUser=${MINIO_ROOT_ACCESS_KEY} \
    --set rootPassword=${MINIO_ROOT_SECRET_KEY} \
    --set persistence.size=${OSS_PV_SIZE} \
    --set domain=${MINIO_DOMAIN} \
    ./charts/minio


## 3. deploy apisix
helm install apisix -n ${NAMESPACE} \
    --set apisix.kind=DaemonSet \
    --set apisix.hostNetwork=true \
    --set credentials.admin=${APISIX_API_KEY} \
    --set etcd.enabled=false \
    --set etcd.host[0]=http://apisix-etcd:2379 \
    --set apisix-ingress-controller.config.apisix.adminKey=${APISIX_API_KEY} \
    ./charts/apisix


## 4. install casdoor
helm install casdoor -n ${NAMESPACE} \
    --set init.client_id=${CASDOOR_CLIENT_ID} \
    --set init.client_secret=${CASDOOR_CLIENT_SECRET} \
    --set init.redirect_uri=${CASDOOR_REDIRECT_URI} \
    ./charts/casdoor


## 5. install laf-web
helm install web -n ${NAMESPACE} \
    ./charts/laf-web


## 6. install laf-server
SERVER_JWT_SECRET=$(tr -cd 'a-f0-9' </dev/urandom |head -c64)
helm install server -n ${NAMESPACE} \
    --set databaseUrl=${DATABASE_URL} \
    --set jwt.secret=${SERVER_JWT_SECRET} \
    --set casdoor.endpoint=${CASDOOR_ENDPOINT} \
    --set casdoor.client_id=${CASDOOR_CLIENT_ID} \
    --set casdoor.client_secret=${CASDOOR_CLIENT_SECRET} \
    --set casdoor.redirect_uri=${CASDOOR_REDIRECT_URI} \
    ./charts/laf-server

## 7. others
helm install laf -n ${NAMESPACE} \
    --set global.domain=${DOMAIN} \
    --set global.region=${REGION} \
    ./charts/laf
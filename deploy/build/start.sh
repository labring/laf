
echo "DOMAIN: $DOMAIN"

# check $DOMAIN is available
if ! host $DOMAIN; then
    echo "Domain $DOMAIN is not available"
    exit 1
fi

# *************** Environment Variables ************** #

## envs - global
HTTP_SCHEMA=${HTTP_SCHEMA:-http}
NAMESPACE=${NAMESPACE:-laf-system}
PASSWD_OR_SECRET=$(tr -cd 'a-z0-9' </dev/urandom |head -c32)

# *************** Deployments **************** #

## 0. create namespace
kubectl create namespace ${NAMESPACE} || true

## 1. install mongodb
set -e
set -x

DATABASE_URL="mongodb://${DB_USERNAME:-admin}:${PASSWD_OR_SECRET}@mongo.${NAMESPACE}.svc.cluster.local:27017/sys_db?authSource=admin&replicaSet=rs0&w=majority"
helm install mongodb -n ${NAMESPACE} \
    --set db.username=${DB_USERNAME:-admin} \
    --set db.password=${PASSWD_OR_SECRET} \
    --set storage.size=${DB_PV_SIZE:-5Gi} \
    ./charts/mongodb


## 2. install minio
MINIO_ROOT_ACCESS_KEY=minio-root-user
MINIO_ROOT_SECRET_KEY=$PASSWD_OR_SECRET
MINIO_DOMAIN=oss.${DOMAIN}
MINIO_EXTERNAL_ENDPOINT="${HTTP_SCHEMA}://${MINIO_DOMAIN}"
MINIO_INTERNAL_ENDPOINT="${HTTP_SCHEMA}://minio.${NAMESPACE}.svc.cluster.local:9000"

helm install minio -n ${NAMESPACE} \
    --set rootUser=${MINIO_ROOT_ACCESS_KEY} \
    --set rootPassword=${MINIO_ROOT_SECRET_KEY} \
    --set persistence.size=${OSS_PV_SIZE:-3Gi} \
    --set domain=${MINIO_DOMAIN} \
    ./charts/minio


# 3. deploy apisix
APISIX_API_URL="http://apisix-admin.${NAMESPACE}.svc.cluster.local:9180/apisix/admin"
APISIX_API_KEY=$PASSWD_OR_SECRET
helm install apisix -n ${NAMESPACE} \
    --set apisix.kind=DaemonSet \
    --set apisix.hostNetwork=true \
    --set admin.credentials.admin=${APISIX_API_KEY} \
    --set etcd.enabled=true \
    --set etcd.host[0]="http://apisix-etcd:2379" \
    --set dashboard.enabled=true    \
    --set ingress-controller.enabled=true   \
    --set ingress-controller.config.apisix.adminKey="${APISIX_API_KEY}" \
    ./charts/apisix


## 4. install casdoor
PG_PASSWORD=$PASSWD_OR_SECRET
helm install postgresql -n ${NAMESPACE} \
    --set postgresql.username=${PG_USERNAME:-adm1n} \
    --set postgresql.password=${PG_PASSWORD} \
    --set postgresql.database=${PG_DATABASE:-casdoor} \
    ./charts/postgresql

CASDOOR_ENDPOINT="${HTTP_SCHEMA}://casdoor.${DOMAIN}"
CASDOOR_CLIENT_ID=$(tr -cd 'a-f0-9' </dev/urandom |head -c21)
CASDOOR_CLIENT_SECRET=$PASSWD_OR_SECRET
CASDOOR_REDIRECT_URI="${HTTP_SCHEMA}://www.${DOMAIN}/login_callback"
helm install casdoor -n ${NAMESPACE} \
    --set init.client_id=${CASDOOR_CLIENT_ID} \
    --set init.client_secret=${CASDOOR_CLIENT_SECRET} \
    --set init.redirect_uri=${CASDOOR_REDIRECT_URI} \
    --set postgresql.host=postgresql \
    --set postgresql.username=${PG_USERNAME:-adm1n} \
    --set postgresql.password=${PG_PASSWORD} \
    --set postgresql.database=${PG_DATABASE:-casdoor} \
    ./charts/casdoor


## 5. install laf-web
helm install web -n ${NAMESPACE} \
    ./charts/laf-web


## 6. install laf-server
SERVER_JWT_SECRET=$PASSWD_OR_SECRET
API_SERVER_URL=${HTTP_SCHEMA}://api.${DOMAIN}
helm install server -n ${NAMESPACE} \
    --set databaseUrl=${DATABASE_URL} \
    --set jwt.secret=${SERVER_JWT_SECRET} \
    --set apiServerUrl=${API_SERVER_URL} \
    --set casdoor.endpoint=${CASDOOR_ENDPOINT} \
    --set casdoor.client_id=${CASDOOR_CLIENT_ID} \
    --set casdoor.client_secret=${CASDOOR_CLIENT_SECRET} \
    --set casdoor.redirect_uri=${CASDOOR_REDIRECT_URI} \
    --set default_region.minio_domain=${MINIO_DOMAIN} \
    --set default_region.minio_external_endpoint=${MINIO_EXTERNAL_ENDPOINT} \
    --set default_region.minio_internal_endpoint=${MINIO_INTERNAL_ENDPOINT} \
    --set default_region.minio_root_access_key=${MINIO_ROOT_ACCESS_KEY} \
    --set default_region.minio_root_secret_key=${MINIO_ROOT_SECRET_KEY} \
    --set default_region.function_domain=${DOMAIN} \
    --set default_region.website_domain=site.${DOMAIN} \
    --set default_region.tls=false \
    --set default_region.apisix_api_url=${APISIX_API_URL} \
    --set default_region.apisix_api_key=${APISIX_API_KEY} \
    --set default_region.apisix_public_port=80 \
    ./charts/laf-server

## 7. others
helm install laf -n ${NAMESPACE} \
    --set global.domain=${DOMAIN} \
    --set global.region=${REGION:-default} \
    --set global.apisix_key=${APISIX_API_KEY} \
    ./charts/laf
#!/bin/bash

# This script is used to run e2e test,
# You can also run it locally to test laf installation and deployment.

# cd to this dir and run `sh e2e.sh` to test

############# setup env vars #############

echo "================= setup env vars ================="

if [ -z "$DOMAIN" ]; then
  DOMAIN="127.0.0.1.nip.io"
fi

export API_ENDPOINT="http://api.${DOMAIN}"

if [ -z "$GET_LAF_API_ROUTE_MAX_RETRY_COUNT" ]; then
  GET_LAF_API_ROUTE_MAX_RETRY_COUNT=60
fi

if [ -z "${LAF_DEPLOYMENT_TIMEOUT}" ]; then
  LAF_DEPLOYMENT_TIMEOUT=180
fi



echo "================= Check Laf Deployment ================="

set +e
kubectl wait --for=condition=Ready pod --all -n laf-system --timeout=${LAF_DEPLOYMENT_TIMEOUT}s
if [ $? -ne 0 ]; then
  echo "some pods in laf-system namespace are not running\n"
  echo "try to describe pods in laf-system namespace whose status is not Running\n"
  kubectl get pods -n laf-system --field-selector=status.phase!=Running -o=name | xargs kubectl describe -n laf-system
  echo "try to log pods in laf-system namespace whose status is not Running\n"
  kubectl get pods -n laf-system --field-selector=status.phase!=Running -o=name | xargs kubectl logs -n laf-system
  exit 1
fi

############## Get Laf config and secrets ##############

export MONGODB_USER=$(kubectl get secret --namespace laf-system mongodb-mongodb-init -o jsonpath="{.data.username}" | base64 --decode)
export MONGODB_PASSWORD=$(kubectl get secret --namespace laf-system mongodb-mongodb-init -o jsonpath="{.data.password}" | base64 --decode)
export MONGO_URI="mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@mongodb-0.mongo.laf-system.svc.cluster.local:27017/sys_db?authSource=admin&replicaSet=rs0&w=majority"

echo "mongodb user is ${MONGODB_USER}"
echo "mongodb passwd is ${MONGODB_PASSWORD}"


echo "================= Get Laf region ================="

response=$(curl -X 'GET' -sS "${API_ENDPOINT}/v1/regions" -H 'accept: */*')
REGION_ID=$(echo $response | jq -r '.data[0]._id')

echo "REGION_ID is ${REGION_ID}"

############## Run tests ##############
echo "================= Run tests ================="
npm test -- --runInBand
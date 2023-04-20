#!/bin/bash

# This script is used to run e2e test,
# You can also run it locally to test laf installation and deployment.

# cd to this dir and run `sh e2e.sh` to test

############# setup env vars #############

echo "================= setup env vars ================="

if [ -z "$DOMAIN" ]; then
  DOMAIN="127.0.0.1.nip.io"
fi

API_ENDPOINT="http://api.${DOMAIN}"

if [ -z "${LAF_DEPLOYMENT_TIMEOUT}" ]; then
  LAF_DEPLOYMENT_TIMEOUT=180
fi

if [ -z "${LAF_SERVER_RESTART_TIMEOUT}" ]; then
  LAF_SERVER_RESTART_TIMEOUT=120
fi

if [ -z "${LAF_CREATE_APP_NS_AND_POD_TIMEOUT}" ]; then
  LAF_CREATE_APP_NS_AND_POD_TIMEOUT=180
fi

# We comment the following line to use this script both in github action and local
# GitHub Action: depoly laf in github action
# Local: deploy laf in advance and use telepresence to forward network requests from laf-server and runtime to local
# Local(on a clean Linux machine): (TODO: uncomment the following line and run)

############# install sealos #############

# echo "================= install sealos ================="

# echo "deb [trusted=yes] https://apt.fury.io/labring/ /" | sudo tee /etc/apt/sources.list.d/labring.list
# sudo apt update
# sudo apt install sealos=4.1.4
# sudo sealos version

############ Dockerize laf in local ############

# TODO: install buildx, build, tag to docker.io/lafyun/laf-xxx:latest (laf-server, laf-web, runtime-node-init)

# ############# Build sealos cluster image #############

# TODO: install buildah and build sealos cluster image

# echo "================= Deploy laf ================="

# sudo sh ../deploy/scripts/install-on-linux.sh $DOMAIN

############## Check Laf Deployment ##############

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

MONGODB_USER=$(kubectl get secret --namespace laf-system mongodb-mongodb-init -o jsonpath="{.data.username}" | base64 --decode)
MONGODB_PASSWORD=$(kubectl get secret --namespace laf-system mongodb-mongodb-init -o jsonpath="{.data.password}" | base64 --decode)

echo "mongodb user is ${MONGODB_USER}"
echo "mongodb passwd is ${MONGODB_PASSWORD}"

############## Get Laf token ##############

echo "================= Get Laf token ================="

# somethimes even all apisix pods are ready but we still got "404 Route Not Found"
# so we need to wait for a while to make sure apisix routes are ready
sleep 15

# set -e
echo "Create a Laf user and get Laf token"

get_laf_token_response=$(curl -X 'POST' -sS -o - \
  "${API_ENDPOINT}/v1/auth/passwd/signup" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  --data-raw '{"username":"laf-user","password":"laf-user-password","type":"Signup"}')

echo "${get_laf_token_response}"

LAF_TOKEN=$(echo "${get_laf_token_response}" | jq -r '.data.token')

echo "LAF_TOKEN is ${LAF_TOKEN}"

if [ -z "${LAF_TOKEN}" ] || [ "${LAF_TOKEN}" = "null" ]; then
    echo "Error: LAF_TOKEN is empty or null."
    exit 1
fi
# echo "LAF_TOKEN=${LAF_TOKEN}" >> $GITHUB_ENV

############### Get Laf region, bundle and runtime id ###############


echo "================= Get Laf region, bundle and runtime id ================="

response=$(curl -X 'GET' -sS "${API_ENDPOINT}/v1/regions" -H 'accept: */*')
REGION_ID=$(echo $response | jq -r '.data[0].id')
BUNDLE_ID=$(echo $response | jq -r '.data[0].bundles[0].id')

echo "REGION_ID is ${REGION_ID}"
echo "BUNDLE_ID is ${BUNDLE_ID}"

# echo "REGION_ID=${REGION_ID}" >> $GITHUB_ENV
# echo "BUNDLE_ID=${BUNDLE_ID}" >> $GITHUB_ENV

response=$(curl -X 'GET' -sS "${API_ENDPOINT}/v1/runtimes" -H 'accept: */*')
RUNTIME_ID=$(echo $response | jq -r '.data[0].id')
echo "RUNTIME_ID is ${RUNTIME_ID}"
# echo "RUNTIME_ID=${RUNTIME_ID}" >> $GITHUB_ENV

############### Create a Laf application ###############

echo "================= Create a Laf application ================="

# set -e

echo "Start to create Laf application"

curl -sS "${API_ENDPOINT}/v1/subscriptions" \
  -H "Accept: application/json, text/plain, */*" \
  -H "Authorization: Bearer ${LAF_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "DNT: 1" \
  -H "Connection: keep-alive" \
  --data-raw "{
    \"name\":\"laf-e2e-test\",
    \"state\":\"Running\",
    \"regionId\":\"${REGION_ID}\",
    \"bundleId\":\"${BUNDLE_ID}\",
    \"subscriptionOption\":{
        \"name\":\"monthly\",
        \"displayName\":\"1 Month\",
        \"duration\":2678400,
        \"price\":0,
        \"specialPrice\":0
    },
    \"runtimeId\":\"${RUNTIME_ID}\",
    \"duration\":2678400
  }" --compressed --insecure

echo ""

echo "Start to get Laf APP_ID"

MAX_RETRIES=30
RETRY_INTERVAL=1

for i in $(seq 1 $MAX_RETRIES); do
  echo "Trying request #$i ... to get APP_ID"
  response=$(curl -s -X 'GET' "${API_ENDPOINT}/v1/applications" \
    -H 'accept: */*' \
    -H "Authorization: Bearer ${LAF_TOKEN}")

  count=$(echo $response | jq '.data | length')

  if [ $count -gt 0 ]
  then
    appid=$(echo $response | jq -r '.data[0].appid')
    export APP_ID=$appid
    echo "APP_ID is ${APP_ID}"
    # echo "APP_ID=${APP_ID}" >> $GITHUB_ENV
    break
  else
    retries=$((retries+1))
    sleep $RETRY_INTERVAL
  fi
done

if [ $count -eq 0 ]
then
  echo "Failed to get APP_ID"
  exit 1
fi

echo "Wait for Laf application to be ready"

# wait for laf-server to create ns
i=0; while [ $i -lt ${LAF_CREATE_APP_NS_AND_POD_TIMEOUT} ]; do if kubectl get namespace ${APP_ID} > /dev/null 2>&1; then break; fi; i=$((i+1)); sleep 1; done

# node: we can not use "kubectl wait --for=condition=Ready pod" straightly because it will cause "no matching resources found" error when pod is not created

pod_count=0; 
i=0; 
while [ $pod_count -eq 0 ] && [ $i -lt ${LAF_CREATE_APP_NS_AND_POD_TIMEOUT} ]; do 
    pod_count=$(kubectl get pods -n ${APP_ID} --no-headers=true | wc -l); 
    if [ $pod_count -eq 0 ]; then 
        sleep 1; 
        i=$((i+1)); 
    fi; 
done; 

if [ $pod_count -eq 0 ]; then
  echo "timeout to create app pod in ${APP_ID} namespace"
  exit 1
fi

# set +e
kubectl wait --for=condition=Ready pod --all -n ${APP_ID} --timeout=${LAF_CREATE_APP_NS_AND_POD_TIMEOUT}s
if [ $? -ne 0 ]; then
  echo "app pod in ${APP_ID} namespace are not running\n"
  echo "try to describe app pod in ${APP_ID} namespace whose status is not Running\n"
  kubectl get pods -n ${APP_ID} --field-selector=status.phase!=Running -o=name | xargs kubectl describe -n ${APP_ID}
  echo "try to log app pod in ${APP_ID} namespace whose status is not Running\n"
  kubectl get pods -n ${APP_ID} --field-selector=status.phase!=Running -o=name | xargs kubectl logs -n ${APP_ID}
  exit 1
fi


################### Note ###################

echo "================= This Code below should be rewritten with js/ts code with e2e test framework ================="

################### Create a function(Hello Laf) ###################

echo "================= Create a function ================="

APP_BASE_URL=http://${APP_ID}.${DOMAIN}

# or may occur "503 Service Temporarily Unavailable"
sleep 5

echo "Create a Hello Laf function"

curl -sS "${API_ENDPOINT}/v1/apps/${APP_ID}/functions" \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7' \
  -H "Authorization: Bearer ${LAF_TOKEN}" \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'DNT: 1' \
  --data @f1-payload.json \
  --compressed \
  --insecure

echo ""

sleep 5

echo "Test Hello Laf function"

curl "${APP_BASE_URL}/f1" -sS -o - \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -H 'DNT: 1' \
  --compressed \
  --insecure  | grep -q '{"data":"hi, laf"}' \
  || (echo "Error: response data during create hello laf function is not expected" && exit 1)

echo ""

echo "Succeed to create Hello Laf function and the response data is expected"

echo "Create a function with db operation and test function PATCH"

################### Create a function(db example) and PATCH ###################

# first create a simple function
curl -sS "${API_ENDPOINT}/v1/apps/${APP_ID}/functions" \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7' \
  -H "Authorization: Bearer ${LAF_TOKEN}" \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'DNT: 1' \
  --data @f2-origin-payload.json \
  --compressed \
  --insecure

echo ""

sleep 1

# then patch it to a db function
curl -X 'PATCH' -sS "${API_ENDPOINT}/v1/apps/${APP_ID}/functions/f2" \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7' \
  -H "Authorization: Bearer ${LAF_TOKEN}" \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'DNT: 1' \
  --data @f2-update-payload.json \
  --compressed \
  --insecure

echo ""

sleep 1

# test POST in the meantime
response=$(curl -X POST -sS ${APP_BASE_URL}/f2 -d '')

ok=$(echo $response | jq -r '.ok')
name=$(echo $response | jq -r '.data.name')

if [ "$ok" != "true" ] || [ "$name" != "hello laf" ]; then
  echo "Error: response data during create db example function is not expected"
  exit 1
fi

echo "Succeed to create db example function and the response data is expected"

# install mongodb
# if [ -x "$(command -v mongo)" ]; then
#     echo "MongoDB client is already installed."
# else
#     # Install MongoDB client using apt
#     echo "MongoDB client is not installed. Installing..."
#     sudo apt update
#     sudo apt install -y mongodb-clients
# fi

# echo "Read databse by API to check if the data is inserted"

####################### execute js/ts test code #######################

echo "================= Test End ================="

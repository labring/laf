
# get & check appid from $1
APPID=$1
if [ -z "$APPID" ]; then
    echo "Usage: $0 <appid>"
    exit 1
fi

NAMESPACE=${APPID}

# get server pod name
POD_NAME=$(kubectl get pods --namespace ${NAMESPACE} -l "laf.dev/appid=${APPID}" -o jsonpath="{.items[0].metadata.name}")

echo "POD_NAME: ${POD_NAME}"

# kubectl exec to get the pod env
kubectl exec -it ${POD_NAME} -n ${NAMESPACE} -- env > .env

# replace 'mongo.laf-system.svc.cluster.local' with '127.0.0.1'
sed -i '' 's/mongodb-0.mongo.laf-system.svc.cluster.local/127.0.0.1/g' .env

# replace 'w=majority' with 'w=majority&directConnection=true'
sed -i '' 's/w=majority/w=majority\&directConnection=true/g' .env
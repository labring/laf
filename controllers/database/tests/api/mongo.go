package api

import (
	"github.com/opentracing/opentracing-go/log"
	"laf/tests/api"
	"strings"
)

const deployYaml = `
---
kind: Service
apiVersion: v1
metadata:
  name: mongo
  namespace: ${namespace}
spec:
  # clusterIP: None
  selector:
    app: mongo
  type: NodePort
  ports:
    - port: 27017
      targetPort: 27017
      nodePort: 30017


### This mongodb ONLY work for demo purpose, you should config your own volume for production use!
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongo
  namespace: ${namespace}
  labels:
    app: mongo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongo
  serviceName: "mongo"
  template:
    metadata:
      labels:
        app: mongo
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - image: docker.io/mongo:latest
          name: mongo
          env:
            - name: MONGO_INITDB_ROOT_USERNAME
              value: root
            - name: MONGO_INITDB_ROOT_PASSWORD
              value: password123
          ports:
            - containerPort: 27017
          volumeMounts:
            - mountPath: /data/db
              name: data
      volumes:
        - name: data
          emptyDir: {}
      restartPolicy: Always
`

func InstallMongoDb(namespace string) {
	api.EnsureNamespace(namespace)

	yamlStr := strings.ReplaceAll(deployYaml, "${namespace}", namespace)
	_, err := api.KubeApply(yamlStr)
	if err != nil {
		log.Error(err)
		panic(err)
	}

	_, err = api.ExecCommand("kubectl wait --for=condition=ready pod -l app=mongo --timeout=300s -n " + namespace)
	if err != nil {
		log.Error(err)
		panic(err)
	}
}

func UninstallMongoDb(namespace string) {
	yamlStr := strings.ReplaceAll(deployYaml, "${namespace}", namespace)
	_, err := api.KubeDelete(yamlStr)
	if err != nil {
		panic(err)
	}
}

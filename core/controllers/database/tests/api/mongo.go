package api

import (
	baseapi "github.com/labring/laf/core/tests/api"
)

const mongoYaml = `
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
      terminationGracePeriodSeconds: 1
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
	params := map[string]string{
		"namespace": namespace,
	}
	_, err := baseapi.KubeApplyFromTemplate(mongoYaml, params)
	if err != nil {
		panic(err)
	}

	_, err = baseapi.Exec("kubectl wait --for=condition=ready pod -l app=mongo --timeout=300s -n " + namespace)
	if err != nil {
		panic(err)
	}
}

func UninstallMongoDb(namespace string) {
	params := map[string]string{
		"namespace": namespace,
	}
	_, err := baseapi.KubeDeleteFromTemplate(mongoYaml, params)
	if err != nil {
		panic(err)
	}

	_, err = baseapi.Exec("kubectl wait --for=delete pod -l app=mongo --timeout=300s -n " + namespace)
	if err != nil {
		panic(err)
	}
}

func GetMongoDbHostname() string {
	return baseapi.GetNodeAddress() + ":30017"
}

func GetMongoDbConnectionUri() string {
	return "mongodb://root:password123@" + GetMongoDbHostname() + "/?authSource=admin&directConnection=true"
}

package api

import (
	"laf/tests/api"
)

var deploy_yaml = `
---
kind: Service
apiVersion: v1
metadata:
  name: mongo
spec:
  # clusterIP: None
  selector:
    app: mongo
  type: ClusterIP
  ports:
    - port: 27017
      targetPort: 27017

### This mongodb ONLY work for demo purpose, you should config your own volume for production use!
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongo
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

func InstallMongoDb() {
	out, err := api.KubeApply(deploy_yaml)
	if err != nil {
		panic(err)
	}
	println(out)

	_, err = api.ExecCommand("kubectl wait --for=condition=ready pod -l app=mongo --timeout=300s")
	if err != nil {
		panic(err)
	}
}

func UninstallMongoDb() {
	out, err := api.KubeDelete(deploy_yaml)
	if err != nil {
		panic(err)
	}
	println(out)
}

package api

import (
	"fmt"
	baseapi "github.com/labring/laf/tests/api"
)

const minioYaml = `
---
kind: Service
apiVersion: v1
metadata:
  name: oss
  namespace: ${namespace}
spec:
  selector:
    app: oss
  # clusterIP: None
  type: NodePort
  ports:
    - port: 9000
      targetPort: 9000
      nodePort: 30090
      name: http
    - port: 9001
      targetPort: 9001
      nodePort: 30091
      name: console


### This oss ONLY work for demo purpose, you should config your own volume for production use!
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: oss
  namespace: ${namespace}
  labels:
    app: oss
spec:
  replicas: 1
  selector:
    matchLabels:
      app: oss
  serviceName: "oss"
  template:
    metadata:
      labels:
        app: oss
    spec:
      terminationGracePeriodSeconds: 1
      containers:
        - image: minio/minio:RELEASE.2022-08-13T21-54-44Z
          name: oss
          env:
            - name: MINIO_ROOT_USER
              value: minio-root-user
            - name: MINIO_ROOT_PASSWORD
              value: minio-root-password
            - name: MINIO_REGION_NAME
              value: ${region}
          command: ["minio", "server", "/data/{0...3}", "--console-address", ":9001"]
          ports:
            - containerPort: 9000
            - containerPort: 9001
          volumeMounts:
            - mountPath: /data
              name: data
      volumes:
        - name: data
          emptyDir: {}
      restartPolicy: Always
`

func InstallMinio(namespace string, region string) {
	params := map[string]string{
		"namespace": namespace,
		"region":    region,
	}
	_, err := baseapi.KubeApplyFromTemplate(minioYaml, params)
	if err != nil {
		panic(err)
	}

	_, err = baseapi.Exec(fmt.Sprintf("kubectl wait --for=condition=ready --timeout=300s pod -l app=oss -n %s", namespace))
	if err != nil {
		panic(err)
	}
}

func UninstallMinio(namespace string) {
	params := map[string]string{
		"namespace": namespace,
	}
	_, err := baseapi.KubeDeleteFromTemplate(minioYaml, params)
	if err != nil {
		panic(err)
	}

	_, err = baseapi.Exec(fmt.Sprintf("kubectl wait --for=delete --timeout=300s pod -l app=oss -n %s", namespace))
	if err != nil {
		panic(err)
	}
}

func GetMinioHostname() string {
	return baseapi.GetNodeAddress() + ":30090"
}

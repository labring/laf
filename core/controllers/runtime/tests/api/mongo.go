package api

import (
	"context"

	baseapi "github.com/labring/laf/core/tests/api"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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

	//port-forward
	go func() {
		_, err = baseapi.Exec("kubectl port-forward service/mongo  27017:27017 -n " + namespace)
		if err != nil {
			panic(err)
		}
	}()

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
	return "127.0.0.1:27017"
}

func GetMongoDbConnectionUri() string {
	return "mongodb://root:password123@" + GetMongoDbHostname() + "/?authSource=admin&directConnection=true"
}

func CreateMongoDatabase() {
	connectionUri := GetMongoDbConnectionUri()
	mm, err := NewMongoManager(context.Background(), connectionUri)
	if err != nil {
		panic(err)
	}
	defer mm.Disconnect()
	err = mm.CreateDatabase("mongodb", "appid-1", "password123password123")
	if err != nil {
		panic(err)
	}
}

// Mongo is a database manager for MongoDB

type MongoManager struct {
	connectionURI string
	client        *mongo.Client
	context       context.Context
}

// NewMongoManager creates a new MongoManager
func NewMongoManager(context context.Context, connectionURI string) (*MongoManager, error) {
	mgm := MongoManager{context: context, connectionURI: connectionURI}
	client, err := mongo.Connect(context, options.Client().ApplyURI(connectionURI))
	mgm.client = client
	if err != nil {
		return nil, err
	}

	return &mgm, nil
}

// CreateDatabase creates the database
// returns the connection uri
func (m *MongoManager) CreateDatabase(databaseName string, username string, password string) error {
	var result bson.M
	command := bson.D{
		{Key: "createUser", Value: username},
		{Key: "pwd", Value: password},
		{Key: "roles", Value: []bson.M{{"role": "readWrite", "db": databaseName}}}}

	err := m.client.Database(databaseName).RunCommand(m.context, command).Decode(&result)
	if err != nil {
		return err
	}

	return nil
}

// DatabaseExists check if database exists
func (m *MongoManager) DatabaseExists(databaseName string) (bool, error) {
	databases, err := m.client.ListDatabaseNames(m.context, bson.M{})
	if err != nil {
		return false, err
	}

	for _, db := range databases {
		if db == databaseName {
			return true, nil
		}
	}

	return false, nil
}

// RemoveUser remove the database user
func (m *MongoManager) RemoveUser(databaseName string, username string) error {
	var result bson.M
	command := bson.D{
		{Key: "dropUser", Value: username},
	}

	err := m.client.Database(databaseName).RunCommand(m.context, command).Decode(&result)
	if err != nil {
		return err
	}

	return nil
}

// Disconnect disconnects from the database
func (m *MongoManager) Disconnect() error {
	if m.client != nil {
		return m.client.Disconnect(m.context)
	}
	return nil
}

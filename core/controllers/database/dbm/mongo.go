package dbm

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

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
		{Key: "roles", Value: []bson.M{{"role": "readWrite", "db": databaseName}, {"role": "dbAdmin", "db": databaseName}}}}

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

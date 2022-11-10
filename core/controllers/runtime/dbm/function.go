package dbm

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type FunctionData struct {
	Name        string   `bson:"name"`
	Description string   `bson:"description"`
	Websocket   bool     `bson:"websocket"`
	Methods     []string `json:"methods"`
	Code        string   `bson:"code"`
	HashCode    string   `bson:"hashcode"` // code hashcode
	Version     int64    `bson:"version"`
}

type FunctionManager struct {
	connectionURI  string
	client         *mongo.Client
	context        context.Context
	databaseName   string
	collectionName string
}

func NewFunctionManager(context context.Context, connectionURI string, databaseName string) (*FunctionManager, error) {
	fm := FunctionManager{context: context, connectionURI: connectionURI}
	client, err := mongo.Connect(context, options.Client().ApplyURI(connectionURI))
	fm.client = client
	fm.databaseName = databaseName
	fm.collectionName = "CloudFunctionData"
	if err != nil {
		return nil, err
	}
	return &fm, nil
}

func (f *FunctionManager) Get(name string) (*FunctionData, error) {
	result := f.client.Database(f.databaseName).Collection(f.collectionName).FindOne(f.context, bson.M{"name": name})

	functionData := &FunctionData{}
	err := result.Decode(functionData)
	// if document not found, return nil
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return functionData, nil
}

func (f *FunctionManager) Insert(fd FunctionData) error {
	_, err := f.client.Database(f.databaseName).Collection(f.collectionName).InsertOne(f.context, fd)
	return err
}

func (f *FunctionManager) Update(name string, update bson.M) error {
	_, err := f.client.Database(f.databaseName).Collection(f.collectionName).UpdateOne(f.context, bson.M{"name": name}, update)
	return err
}

func (f *FunctionManager) Delete(name string) error {
	_, err := f.client.Database(f.databaseName).Collection(f.collectionName).DeleteOne(f.context, bson.M{"name": name})
	return err
}

func (f *FunctionManager) Disconnect() {
	f.client.Disconnect(f.context)
}

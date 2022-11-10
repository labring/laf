package dbm

import (
	"context"
	"testing"
)

func TestInsert(t *testing.T) {
	fm, err := NewFunctionManager(context.TODO(), "mongodb://appid-1:password123password123@127.0.0.1:27017/?authSource=mongodb", "mongodb")
	if err != nil {
		t.Error(err)
	}
	defer fm.Disconnect()

	err = fm.Insert(FunctionData{
		Name:        "test",
		Description: "test",
		Websocket:   true,
		Methods:     []string{"GET", "POST"},
		Code:        "test",
		Version:     0,
	})

}

func TestDelete(t *testing.T) {
	fm, err := NewFunctionManager(context.TODO(), "mongodb://appid-1:password123password123@127.0.0.1:27017/?authSource=mongodb", "mongodb")
	if err != nil {
		t.Error(err)
	}
	defer fm.Disconnect()
	err = fm.Delete("test")
	if err != nil {
		t.Error(err)
	}
}

func TestUpdate(t *testing.T) {
	fm, err := NewFunctionManager(context.TODO(), "mongodb://appid-1:password123password123@127.0.0.1:27017/?authSource=mongodb", "mongodb")
	if err != nil {
		t.Error(err)
	}
	defer fm.Disconnect()
	err = fm.Update("function-sample", map[string]interface{}{
		"$set": map[string]interface{}{
			"version": 1,
			"code":    "test",
		},
	})
	if err != nil {
		t.Error(err)
	}
}

func TestGet(t *testing.T) {
	fm, err := NewFunctionManager(context.TODO(), "mongodb://appid-1:password123password123@127.0.0.1:27017/?authSource=mongodb", "mongodb")
	if err != nil {
		t.Error(err)
	}
	defer fm.Disconnect()
	fd, err := fm.Get("test")
	if err != nil {
		t.Error(err)
	}
	t.Log(fd)
}

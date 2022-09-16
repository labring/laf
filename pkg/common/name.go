package controllers

import (
	gonanoid "github.com/matoous/go-nanoid/v2"
	"os"
	"strconv"
)

func GetSystemNamespace() string {
	name := "laf-system"
	if ns := os.Getenv("SYSTEM_NAMESPACE"); ns != "" {
		name = ns
	}
	return name
}

func GetApplicationNamespace(appid string) string {
	prefix := ""
	if prefixStr := os.Getenv("APP_NAMESPACE_PREFIX"); prefixStr != "" {
		prefix = prefixStr
	}

	return prefix + appid
}

// GenerateAppId generates app id
func GenerateAppId() (string, error) {
	const alphabet = "23456789abcdefghijklmnopqrstuvwxyz"
	size := 6

	// get size from env
	if sizeStr := os.Getenv("APPID_LENGTH"); sizeStr != "" {
		n, err := strconv.ParseInt(sizeStr, 10, 64)
		if err == nil {
			size = int(n)
		}
	}

	appid, err := gonanoid.Generate(alphabet, size)
	return appid, err
}



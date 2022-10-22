package common

import gonanoid "github.com/matoous/go-nanoid"

const FullAlphaNumeric = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const AlphaNumeric = "0123456789abcdefghijklmnopqrstuvwxyz"

func GenerateAlphaNumericPassword(size int) string {
	// Generate a random password
	password, err := gonanoid.Generate(FullAlphaNumeric, size)
	if err != nil {
		panic(err)
	}
	return password
}

func GenerateLowerCaseRandomString(size int) string {
	// Generate a random password
	password, err := gonanoid.Generate(AlphaNumeric, size)
	if err != nil {
		panic(err)
	}
	return password
}

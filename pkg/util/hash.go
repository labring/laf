package util

import (
	"hash/fnv"
	"strconv"
)

// StringHash Hash returns a hash of the given string
func StringHash(s string) string {
	h := fnv.New32a()
	h.Write([]byte(s))
	return strconv.Itoa(int(h.Sum32()))
}

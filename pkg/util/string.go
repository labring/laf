package util

func ContainsString(finalizers []string, s string) bool {
	for _, f := range finalizers {
		if f == s {
			return true
		}
	}
	return false
}

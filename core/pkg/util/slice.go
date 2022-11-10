package util

func ContainsString(finalizers []string, s string) bool {
	for _, f := range finalizers {
		if f == s {
			return true
		}
	}
	return false
}

func RemoveString(finalizers []string, s string) []string {
	for i, v := range finalizers {
		if v == s {
			return append(finalizers[:i], finalizers[i+1:]...)
		}
	}
	return finalizers
}

func EqualsSlice(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

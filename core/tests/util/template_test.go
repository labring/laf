package util

import "testing"

func TestRenderTemplate(t *testing.T) {

	oldTempl := `
apiVersion: oss.laf.dev/v1
kind: Bucket
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
spec:
  policy: readonly
  storage: 100Mi
status:
  capacity:
    maxStorage: 100Mi
    objectCount: 0
    storage: '0'
  policy: readonly
  user: app1
  versioning: true
`
	newTempl, err := RenderTemplate(oldTempl, map[string]string{
		"name":      "app1",
		"namespace": "default",
	})
	if err != nil {
		t.Fatal(err)
	}
	t.Log(newTempl)
}

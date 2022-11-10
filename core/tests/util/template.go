package util

import (
	"bytes"
	"text/template"
)

func RenderTemplate(temp string, data map[string]string) (string, error) {
	tpl, err := template.New("temp").Parse(temp)
	if err != nil {
		return "", err
	}

	buf := bytes.NewBuffer([]byte{})
	err = tpl.Execute(buf, data)
	if err != nil {
		return "", err
	}
	return buf.String(), nil
}

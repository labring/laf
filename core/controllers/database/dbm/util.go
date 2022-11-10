package dbm

import "net/url"

func AssembleUserDatabaseUri(originalUri string, newUser string, newPassword string, newDb string) (string, error) {
	// assemble the connection uri
	u, err := url.Parse(originalUri)
	if err != nil {
		return "", err
	}
	u.User = url.UserPassword(newUser, newPassword)
	q := u.Query()
	q.Set("authSource", newDb)
	u.RawQuery = q.Encode()

	return u.String(), nil
}

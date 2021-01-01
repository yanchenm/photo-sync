package db

import (
	"database/sql"
	"fmt"

	"github.com/yanchenm/photo-sync/models"
)

func (db Database) AddToken(token models.RefreshToken) error {
	query := `INSERT INTO auth (email, token) VALUES ($1, $2);`
	_, err := db.Conn.Exec(query, token.Email, token.Token)
	return err
}

func (db Database) TokenValid(token models.RefreshToken) bool {
	dbToken := models.RefreshToken{}
	query := `SELECT * FROM auth WHERE email = $1 AND token = $2;`

	row := db.Conn.QueryRow(query, token.Email, token.Token)
	err := row.Scan(&dbToken.Email, &dbToken.Token)
	return err == nil
}

func (db Database) DeleteToken(token models.RefreshToken) error {
	query := `DELETE FROM auth WHERE email = $1 AND token = $2;`
	_, err := db.Conn.Exec(query, token.Email, token.Token)

	switch err {
	case sql.ErrNoRows:
		return fmt.Errorf("no matching record")
	default:
		return err
	}
}

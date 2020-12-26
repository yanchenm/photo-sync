package db

import (
	"database/sql"
	"fmt"
	"github.com/yanchenm/photo-sync/models"
)

func (db Database) GetUserFromEmail(email string) (models.User, error) {
	user := models.User{}
	query := `SELECT * FROM users WHERE email = $1;`

	row := db.Conn.QueryRow(query, email)
	err := row.Scan(&user.Email, &user.Name, &user.Password, &user.CreatedAt)

	switch err {
	case sql.ErrNoRows:
		return user, fmt.Errorf("no matching record")
	default:
		return user, err
	}
}

func (db Database) AddUser(user *models.User) error {
	var createdAt string

	query := `INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING created_at;`
	err := db.Conn.QueryRow(query, user.Email, user.Name, user.Password).Scan(&createdAt)
	if err != nil {
		return err
	}

	user.CreatedAt = createdAt
	return nil
}

func (db Database) DeleteUser(email string) error {
	query := `DELETE FROM users WHERE email = $1;`
	_, err := db.Conn.Exec(query, email)

	switch err {
	case sql.ErrNoRows:
		return fmt.Errorf("no matching record")
	default:
		return err
	}
}

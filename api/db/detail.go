package db

import (
	"database/sql"
	"fmt"

	"github.com/yanchenm/photo-sync/models"
)

func (db Database) GetDetailForPhoto(id string) (models.Detail, error) {
	detail := models.Detail{}
	query := `SELECT * FROM details WHERE id = $1;`

	row := db.Conn.QueryRow(query, id)
	err := row.Scan(&detail.ID, &detail.FileType, &detail.Height, &detail.Width, &detail.Size, &detail.UploadedAt)

	switch err {
	case sql.ErrNoRows:
		return detail, fmt.Errorf("no matching record")
	default:
		return detail, err
	}
}

func (db Database) AddDetail(detail *models.Detail) error {
	query := `INSERT INTO details (id, filetype, height, width, size, uploaded_at) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := db.Conn.Exec(query, detail.ID, detail.FileType, detail.Height, detail.Width, detail.Size, detail.UploadedAt)

	return err
}

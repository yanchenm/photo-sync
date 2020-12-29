package db

import (
	"database/sql"
	"fmt"

	"github.com/yanchenm/photo-sync/models"
)

func (db Database) GetPhotos(user models.User, start, count int) (*models.PhotoList, error) {
	res := &models.PhotoList{}
	query := `SELECT * FROM photos WHERE username = $1 ORDER BY uploaded_at DESC LIMIT $2 OFFSET $3;`

	rows, err := db.Conn.Query(query, user.Email, count, start)
	if err != nil {
		return res, err
	}

	defer rows.Close()

	for rows.Next() {
		var photo models.Photo
		err := rows.Scan(&photo.ID, &photo.User, &photo.Filename, &photo.Key, &photo.Thumbnail, &photo.UploadedAt)
		if err != nil {
			return res, nil
		}

		res.Photos = append(res.Photos, photo)
	}

	return res, nil
}

func (db Database) GetPhotoById(id string) (models.Photo, error) {
	photo := models.Photo{}
	query := `SELECT * FROM photos WHERE id = $1;`

	row := db.Conn.QueryRow(query, id)
	err := row.Scan(&photo.ID, &photo.User, &photo.Filename, &photo.Key, &photo.Thumbnail, &photo.UploadedAt)

	switch err {
	case sql.ErrNoRows:
		return photo, fmt.Errorf("no matching record")
	default:
		return photo, err
	}
}

func (db Database) AddPhoto(photo *models.Photo) error {
	var uploadedAt string

	query := `INSERT INTO photos (id, username, filename, key, thumbnail) VALUES ($1, $2, $3, $4, $5) RETURNING uploaded_at;`
	err := db.Conn.QueryRow(query, photo.ID, photo.User, photo.Filename, photo.Key, photo.Thumbnail).Scan(&uploadedAt)
	if err != nil {
		return err
	}

	photo.UploadedAt = uploadedAt
	return nil
}

func (db Database) DeletePhoto(id string) error {
	query := `DELETE FROM photos WHERE id = $1;`
	_, err := db.Conn.Exec(query, id)

	switch err {
	case sql.ErrNoRows:
		return fmt.Errorf("no matching record")
	default:
		return err
	}
}

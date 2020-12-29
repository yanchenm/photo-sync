package models

type Photo struct {
	ID         string `json:"id"`
	User       string `json:"user"`
	Filename   string `json:"filename"`
	Key        string `json:"key"`
	Thumbnail  string `json:"thumbnail"`
	UploadedAt string `json:"uploaded_at"`
}

type PhotoList struct {
	Photos []Photo `json:"photos"`
}

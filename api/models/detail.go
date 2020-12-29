package models

type Detail struct {
	ID          string  `json:"id"`
	FileType    string  `json:"file_type"`
	Height      int     `json:"height"`
	Width       int     `json:"width"`
	Size        float32 `json:"size"`
	UploadedAt  string  `json:"uploaded_at"`
}

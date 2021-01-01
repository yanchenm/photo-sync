package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"image"
	_ "image/gif"
	"image/jpeg"
	_ "image/png"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/gorilla/mux"
	"github.com/nfnt/resize"
	"github.com/segmentio/ksuid"

	"github.com/yanchenm/photo-sync/models"
)

type GetPhotosParams struct {
	Start int `json:"start"`
	Count int `json:"count"`
}

func uploadToS3(sess *session.Session, bucket, key string, file io.Reader) error {
	uploader := s3manager.NewUploader(sess)

	_, err := uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
		Body:   file,
	})

	return err
}

func generateSignedUrl(sess *session.Session, bucket, key, fileName string) (string, error) {
	svc := s3.New(sess)

	fileNameParam := fmt.Sprintf("attachment; filename=\"%s\"", fileName)
	req, _ := svc.GetObjectRequest(&s3.GetObjectInput{
		Bucket:                     aws.String(bucket),
		Key:                        aws.String(key),
		ResponseContentDisposition: aws.String(fileNameParam),
	})

	return req.Presign(1 * time.Minute)
}

func (s *Server) handleUploadPhoto(w http.ResponseWriter, r *http.Request, user models.User) {
	photo := models.Photo{
		User: user.Email,
	}

	// Set max photo size to 10MB
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		_ = logErrorAndRespond(w, http.StatusBadRequest, "failed to parse form", err)
		return
	}

	// Get photo from request body
	file, header, err := r.FormFile("photo")
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusBadRequest, "invalid file upload", err)
		return
	}

	fileName := header.Filename
	photo.Filename = fileName

	// Generate unique ID for photo
	id := ksuid.New().String()
	photo.ID = id

	// Read image upload into buffer
	buffer := new(bytes.Buffer)
	size, err := buffer.ReadFrom(file)
	file.Close()
	fileBuffer := buffer.Bytes()

	if err != nil {
		_ = logErrorAndRespond(w, http.StatusBadRequest, "invalid image file", err)
		return
	}

	// Open image
	img, fileType, err := image.Decode(bytes.NewReader(fileBuffer))
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusBadRequest, "invalid image file", err)
		return
	}

	// Get photo details
	config, _, err := image.DecodeConfig(bytes.NewReader(fileBuffer))
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusBadRequest, "invalid image file", err)
		return
	}

	detail := models.Detail{
		ID:       id,
		FileType: fileType,
		Height:   config.Height,
		Width:    config.Width,
		Size:     float32(size) / float32(1024*1024),
	}

	// Create a thumbnail to display on main page
	thumbnail := resize.Thumbnail(600, 600, img, resize.Bicubic)

	pr, pw := io.Pipe()

	go func() {
		jpeg.Encode(pw, thumbnail, &jpeg.Options{Quality: 90})
		pw.Close()
	}()

	// Upload image and thumbnail to S3
	sess, err := getNewAWSSession(os.Getenv("AWS_REGION"))
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to initialize AWS session", err)
		return
	}

	err = uploadToS3(sess, os.Getenv("S3_BUCKET"), id+"."+fileType, bytes.NewReader(fileBuffer))
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to upload to S3", err)
		return
	}

	err = uploadToS3(sess, os.Getenv("S3_BUCKET"), id+"_thumb.jpeg", pr)
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to upload to S3", err)
		return
	}

	photo.Key = id + "." + fileType
	photo.Thumbnail = id + "_thumb.jpeg"

	if err := s.DB.AddPhoto(&photo); err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to add photo to database", err)
		return
	}

	photo.Details = detail

	if err := s.DB.AddDetail(&detail); err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to add photo details to database", err)
		return
	}
	_ = respondWithJSON(w, http.StatusOK, photo)
}

func (s *Server) handleGetPhotos(w http.ResponseWriter, r *http.Request, user models.User) {
	params := GetPhotosParams{}

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&params); err != nil {
		_ = logErrorAndRespond(w, http.StatusBadRequest, "invalid request payload", err)
		return
	}

	defer r.Body.Close()

	photos, err := s.DB.GetPhotos(user, params.Start, params.Count)
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to get photos from database", err)
		return
	}

	sess, err := getNewAWSSession(os.Getenv("AWS_REGION"))
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "unable to establish AWS session", err)
		return
	}

	for i, photo := range photos.Photos {
		signedUrl, err := generateSignedUrl(sess, os.Getenv("S3_BUCKET"), photo.Key, photo.Filename)
		if err != nil {
			msg := fmt.Sprintf("error signing url for photo %s", photo.ID)
			_ = logErrorAndRespond(w, http.StatusInternalServerError, msg, err)
			return
		}

		photos.Photos[i].Url = signedUrl
	}

	_ = respondWithJSON(w, http.StatusCreated, photos)
}

func (s *Server) handleGetPhotoByID(w http.ResponseWriter, r *http.Request, user models.User) {
	params := mux.Vars(r)
	id := params["id"]

	photo, err := s.DB.GetPhotoById(id)
	if err != nil {
		switch err.Error() {
		case "no matching record":
			_ = logErrorAndRespond(w, http.StatusNotFound, "photo does not exist", err)
			return
		default:
			_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to get photo", err)
			return
		}
	}

	if photo.User != user.Email {
		_ = respondWithError(w, http.StatusUnauthorized, "you don't have permission to view this photo")
		return
	}

	detail, err := s.DB.GetDetailForPhoto(id)
	if err != nil {
		switch err.Error() {
		case "no matching record":
			_ = logErrorAndRespond(w, http.StatusNotFound, "photo details do not exist", err)
			return
		default:
			_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to get photo details", err)
			return
		}
	}

	sess, err := getNewAWSSession(os.Getenv("AWS_REGION"))
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "unable to establish AWS session", err)
		return
	}

	signedUrl, err := generateSignedUrl(sess, os.Getenv("S3_BUCKET"), photo.Key, photo.Filename)
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "error signing url for photo", err)
		return
	}

	photo.Url = signedUrl
	photo.Details = detail

	_ = respondWithJSON(w, http.StatusOK, photo)
}

func (s *Server) handleDeletePhoto(w http.ResponseWriter, r *http.Request, user models.User) {
	params := mux.Vars(r)
	id := params["id"]

	photo, err := s.DB.GetPhotoById(id)
	if err != nil {
		switch err.Error() {
		case "no matching record":
			_ = logErrorAndRespond(w, http.StatusNotFound, "photo does not exist", err)
			return
		default:
			_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to get photo", err)
			return
		}
	}

	if photo.User != user.Email {
		_ = respondWithError(w, http.StatusUnauthorized, "you don't have permission to view this photo")
		return
	}

	// Remove photo from S3
	sess, err := getNewAWSSession(os.Getenv("AWS_REGION"))
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to establish AWS session", err)
		return
	}

	svc := s3.New(sess)
	_, err = svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(os.Getenv("S3_BUCKET")),
		Key:    aws.String(photo.Key),
	})

	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "unable to delete photo", err)
		return
	}

	_, err = svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(os.Getenv("S3_BUCKET")),
		Key:    aws.String(photo.Thumbnail),
	})

	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "unable to delete photo", err)
		return
	}

	if err := s.DB.DeletePhoto(id); err != nil {
		switch err.Error() {
		case "no matching record":
			_ = logErrorAndRespond(w, http.StatusNotFound, "photo does not exist", err)
			return
		default:
			_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to delete photo", err)
			return
		}
	}

	_ = respondWithJSON(w, http.StatusOK, nil)
}

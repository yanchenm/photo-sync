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
	log "github.com/sirupsen/logrus"

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

func (s *Server) handleUploadPhoto(w http.ResponseWriter, r *http.Request) {
	photo := models.Photo{
		User: "yanchenm@gmail.com",
	}

	// Set max photo size to 10MB
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		log.Error(fmt.Sprintf("error parsing form: %s", err))
		_ = respondWithError(w, http.StatusBadRequest, "Invalid form")
		return
	}

	// Get photo from request body
	log.Info("reading photo from request")
	file, header, err := r.FormFile("photo")
	if err != nil {
		log.Error(fmt.Sprintf("error parsing upload: %s", err))
		_ = respondWithError(w, http.StatusBadRequest, "Invalid file upload")
		return
	}

	fileName := header.Filename
	photo.Filename = fileName

	// Generate unique ID for photo
	id := ksuid.New().String()
	photo.ID = id

	// Read image upload into buffer
	log.Info("reading file into buffer")
	buffer := new(bytes.Buffer)
	size, err := buffer.ReadFrom(file)
	file.Close()
	fileBuffer := buffer.Bytes()

	if err != nil {
		log.Error(fmt.Sprintf("error reading photo: %s", err))
		_ = respondWithError(w, http.StatusBadRequest, "Invalid image file")
		return
	}

	// Open image
	log.Info("reading image")
	img, fileType, err := image.Decode(bytes.NewReader(fileBuffer))
	if err != nil {
		log.Error(fmt.Sprintf("error decoding photo: %s", err))
		_ = respondWithError(w, http.StatusBadRequest, "Invalid image file")
		return
	}

	// Get photo details
	log.Info("reading image config")
	config, _, err := image.DecodeConfig(bytes.NewReader(fileBuffer))
	if err != nil {
		log.Error(fmt.Sprintf("error decoding photo config: %s", err))
		_ = respondWithError(w, http.StatusBadRequest, "Invalid image file")
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
	log.Info("creating thumbnail")
	thumbnail := resize.Thumbnail(600, 600, img, resize.Bicubic)

	pr, pw := io.Pipe()

	go func() {
		log.Info("writing image to pipe")
		jpeg.Encode(pw, thumbnail, &jpeg.Options{Quality: 90})
		pw.Close()
	}()

	// Upload image and thumbnail to S3
	log.Info("starting new AWS session")
	sess, err := getNewAWSSession(os.Getenv("AWS_REGION"))

	if err != nil {
		log.Error(fmt.Sprintf("error initializing AWS session: %s", err))
		_ = respondWithError(w, http.StatusInternalServerError, "Error connecting to S3")
		return
	}

	log.Info(fmt.Sprintf("uploading %s to s3", id+"."+fileType))
	err = uploadToS3(sess, os.Getenv("S3_BUCKET"), id+"."+fileType, bytes.NewReader(fileBuffer))
	if err != nil {
		log.Error(fmt.Sprintf("error uploading to S3: %s", err))
		_ = respondWithError(w, http.StatusInternalServerError, "Error uploading to S3")
		return
	}

	log.Info(fmt.Sprintf("uploading %s to s3", id+"_thumb.jpeg"))
	err = uploadToS3(sess, os.Getenv("S3_BUCKET"), id+"_thumb.jpeg", pr)
	if err != nil {
		log.Error(fmt.Sprintf("error uploading to S3: %s", err))
		_ = respondWithError(w, http.StatusInternalServerError, "Error uploading to S3")
		return
	}

	photo.Key = id + "." + fileType
	photo.Thumbnail = id + "_thumb.jpeg"

	if err := s.DB.AddPhoto(&photo); err != nil {
		log.Error(fmt.Sprintf("error adding photo to db: %s", err))
		_ = respondWithError(w, http.StatusInternalServerError, "Error adding photo to database")
		return
	}

	detail.UploadedAt = photo.UploadedAt

	if err := s.DB.AddDetail(&detail); err != nil {
		log.Error(fmt.Sprintf("error adding photo detail to db: %s", err))
		_ = respondWithError(w, http.StatusInternalServerError, "Error adding photo detail to database")
		return
	}
	_ = respondWithJSON(w, http.StatusOK, photo)
}

func (s *Server) handleGetPhotos(w http.ResponseWriter, r *http.Request) {
	params := GetPhotosParams{}

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&params); err != nil {
		log.Error(fmt.Sprintf("error decoding request: %s", err))
		_ = respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	defer r.Body.Close()

	photos, err := s.DB.GetPhotos(models.User{Email: "yanchenm@gmail.com"}, params.Start, params.Count)
	if err != nil {
		log.Error(fmt.Sprintf("error getting photos from database: %s", err))
		_ = respondWithError(w, http.StatusInternalServerError, err.Error())
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

	_ = respondWithJSON(w, http.StatusOK, photos)
}

func (s *Server) handleGetPhotoByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["id"]

	photo, err := s.DB.GetPhotoById(id)
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "unable to get photo from database", err)
		return
	}

	detail, err := s.DB.GetDetailForPhoto(id)
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "unable to get photo details from database", err)
		return
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

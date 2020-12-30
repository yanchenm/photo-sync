package server

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"

	"github.com/yanchenm/photo-sync/db"
)

type Server struct {
	Router *mux.Router
	DB     *db.Database
}

func Initialize(username, password, database string) (*Server, error) {
	newDB, err := db.Initialize(username, password, database)
	if err != nil {
		return nil, err
	}

	router := mux.NewRouter()

	s := &Server{
		DB:     &newDB,
		Router: router,
	}

	s.initializeRoutes()
	return s, nil
}

func (s *Server) initializeRoutes() {
	s.Router.HandleFunc("/users/new", s.handleAddUser).Methods("POST")
	s.Router.HandleFunc("/photos/new", s.handleUploadPhoto).Methods("POST")
	s.Router.HandleFunc("/photos", s.handleGetPhotos).Methods("GET")
	s.Router.HandleFunc("/photos/{id}", s.handleGetPhotoByID).Methods("GET")
	s.Router.HandleFunc("/photos/{id}", s.handleDeletePhoto).Methods("DELETE")
}

func (s *Server) Run(addr string) {
	log.Fatal(http.ListenAndServe(addr, s.Router))
}

func respondWithJSON(w http.ResponseWriter, status int, payload interface{}) error {
	response, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, err = w.Write(response)

	return err
}

func respondWithError(w http.ResponseWriter, status int, message string) error {
	return respondWithJSON(w, status, map[string]string{"error": message})
}

func logErrorAndRespond(w http.ResponseWriter, status int, message string, err error) error {
	log.Error(fmt.Sprintf("%s: %s", message, err))
	return respondWithError(w, status, message)
}

func getNewAWSSession(region string) (*session.Session, error) {
	return session.NewSession(&aws.Config{
		Region: aws.String(region),
	})
}

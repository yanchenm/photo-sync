package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
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
	s.Router.HandleFunc("/api/users/new", s.handleAddUser).Methods("POST")
	s.Router.HandleFunc("/api/photos/new", s.authenticate(s.handleUploadPhoto)).Methods("POST")
	s.Router.HandleFunc("/api/photos", s.authenticate(s.handleGetPhotos)).Methods("GET")
	s.Router.HandleFunc("/api/photos/{id}", s.authenticate(s.handleGetPhotoByID)).Methods("GET")
	s.Router.HandleFunc("/api/photos/{id}", s.authenticate(s.handleDeletePhoto)).Methods("DELETE")
	s.Router.HandleFunc("/api/login", s.login).Methods("POST")
	s.Router.HandleFunc("/api/logout", s.authenticate(s.logout)).Methods("POST")
	s.Router.HandleFunc("/api/refresh", s.refreshAuth).Methods("POST")
}

func (s *Server) Run(addr string) {
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowCredentials: true,
	})

	loggedRouter := handlers.LoggingHandler(os.Stdout, s.Router)
	handler := c.Handler(loggedRouter)
	log.Fatal(http.ListenAndServe(addr, handler))
	defer s.DB.Conn.Close()
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

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
	s.Router.HandleFunc("/users/new", s.handleAddUser).Methods("POST")
	s.Router.HandleFunc("/photos", s.authenticate(s.handleUploadPhoto)).Methods("POST")
	s.Router.HandleFunc("/photos", s.authenticate(s.handleGetPhotos)).Methods("GET")
	s.Router.HandleFunc("/photos/{id}", s.authenticate(s.handleGetPhotoByID)).Methods("GET")
	s.Router.HandleFunc("/photos/{id}", s.authenticate(s.handleDeletePhoto)).Methods("DELETE")
	s.Router.HandleFunc("/login", s.login).Methods("POST")
	s.Router.HandleFunc("/logout", s.authenticate(s.logout)).Methods("POST")
	s.Router.HandleFunc("/refresh", s.refreshAuth).Methods("POST")
	s.Router.HandleFunc("/user", s.authenticate(s.handleGetAuthenticatedUser)).Methods("GET")
	s.Router.HandleFunc("/user/{email}", s.authenticate(s.handleGetUserByEmail)).Methods("GET")
}

func (s *Server) Run(addr string) {
	var frontendUrl string
	if os.Getenv("ENVIRONMENT") == "PROD" {
		frontendUrl = "https://photos.runny.cloud"
	} else {
		frontendUrl = "http://localhost:3000"
	}

	c := cors.New(cors.Options{
		AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodDelete},
		AllowedOrigins:   []string{frontendUrl},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		Debug:            true,
	})

	loggedRouter := handlers.LoggingHandler(os.Stdout, s.Router)
	handler := c.Handler(loggedRouter)
	log.Fatal(http.ListenAndServe(addr, handler))
	defer s.DB.Conn.Close()
}

func respondWithJSON(w http.ResponseWriter, status int, payload interface{}) {
	response, _ := json.Marshal(payload)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, _ = w.Write(response)
}

func respondWithError(w http.ResponseWriter, status int, message string) {
	respondWithJSON(w, status, map[string]string{"error": message})
}

func logErrorAndRespond(w http.ResponseWriter, status int, message string, err error) {
	log.Error(fmt.Sprintf("%s: %s", message, err))
	respondWithError(w, status, message)
}

func getNewAWSSession(region string) (*session.Session, error) {
	return session.NewSession(&aws.Config{
		Region: aws.String(region),
	})
}

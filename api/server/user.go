package server

import (
	"encoding/json"
	"fmt"
	"net/http"

	log "github.com/sirupsen/logrus"
	"github.com/yanchenm/photo-sync/models"
)

func (s *Server) handleAddUser(w http.ResponseWriter, r *http.Request) {
	user := models.User{}
	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&user); err != nil {
		log.Error(fmt.Sprintf("error decoding request: %s", err))
		_ = respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	defer r.Body.Close()

	if err := user.HashPassword(); err != nil {
		log.Error(fmt.Sprintf("error hashing password: %s", err))
		_ = respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := s.DB.AddUser(&user); err != nil {
		log.Error(fmt.Sprintf("error creating user: %s", err))
		_ = respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	_ = respondWithJSON(w, http.StatusCreated, user)
}

package server

import (
	"encoding/json"
	"net/http"

	"github.com/yanchenm/photo-sync/models"
)

func (s *Server) handleAddUser(w http.ResponseWriter, r *http.Request) {
	user := models.User{}
	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&user); err != nil {
		_ = logErrorAndRespond(w, http.StatusBadRequest, "invalid request payload", err)
		return
	}

	defer r.Body.Close()

	if err := user.HashPassword(); err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to process password", err)
		return
	}

	if err := s.DB.AddUser(&user); err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to create user", err)
		return
	}

	user.BeforeSend()
	_ = respondWithJSON(w, http.StatusCreated, user)
}

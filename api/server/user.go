package server

import (
	"encoding/json"
	"fmt"
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

	if user.Email == "" || user.Name == "" || user.Password == "" {
		fields := []string{"email", "name", "password"}
		var missing []string

		for _, field := range fields {
			if r.FormValue(field) == "" {
				missing = append(missing, field)
			}
		}

		_ = logErrorAndRespond(w, http.StatusBadRequest, "missing required fields", fmt.Errorf("%v", missing))
		return
	}

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

func (s *Server) handleGetAuthenticatedUser(w http.ResponseWriter, r *http.Request, authUser models.User) {
	user, err := s.DB.GetUserFromEmail(authUser.Email)
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to get user details", err)
		return
	}

	user.BeforeSend()
	_ = respondWithJSON(w, http.StatusOK, user)
}

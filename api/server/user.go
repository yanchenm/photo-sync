package server

import (
	"fmt"
	"net/http"

	"github.com/yanchenm/photo-sync/models"
)

func (s *Server) handleAddUser(w http.ResponseWriter, r *http.Request) {
	user := models.User{}

	if err := r.ParseForm(); err != nil {
		_ = logErrorAndRespond(w, http.StatusBadRequest, "invalid request payload", err)
		return
	}

	user.Email = r.FormValue("email")
	user.Name = r.FormValue("name")
	user.Password = r.FormValue("password")

	if user.Email == "" || user.Name == "" || user.Password == "" {
		fields := []string{"email", "name", "password"}
		missing := []string{}

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

package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"

	"github.com/yanchenm/photo-sync/models"
)

func (s *Server) handleAddUser(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("DISABLE_SIGN_UP") != "false" {
		respondWithError(w, http.StatusForbidden, "you can't do that")
		return
	}

	user := models.User{}
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&user); err != nil {
		logErrorAndRespond(w, http.StatusBadRequest, "invalid request payload", err)
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

		logErrorAndRespond(w, http.StatusBadRequest, "missing required fields", fmt.Errorf("%v", missing))
		return
	}

	if err := user.HashPassword(); err != nil {
		logErrorAndRespond(w, http.StatusInternalServerError, "failed to process password", err)
		return
	}

	if err := s.DB.AddUser(&user); err != nil {
		logErrorAndRespond(w, http.StatusInternalServerError, "failed to create user", err)
		return
	}

	user.BeforeSend()
	respondWithJSON(w, http.StatusCreated, user)
}

func (s *Server) handleGetAuthenticatedUser(w http.ResponseWriter, r *http.Request, authUser models.User) {
	user, err := s.DB.GetUserFromEmail(authUser.Email)
	if err != nil {
		logErrorAndRespond(w, http.StatusInternalServerError, "failed to get user details", err)
		return
	}

	user.BeforeSend()
	respondWithJSON(w, http.StatusOK, user)
}

func (s *Server) handleGetUserByEmail(w http.ResponseWriter, r *http.Request, _ models.User) {
	params := mux.Vars(r)
	email := params["email"]

	if email == "" {
		logErrorAndRespond(w, http.StatusBadRequest, "missing or invalid email", nil)
	}

	user, err := s.DB.GetUserFromEmail(email)
	if err != nil {
		logErrorAndRespond(w, http.StatusInternalServerError, "failed to get user details", err)
		return
	}

	user.BeforeSend()
	user.CreatedAt = ""
	respondWithJSON(w, http.StatusOK, user)
}

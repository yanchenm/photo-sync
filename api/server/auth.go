package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"

	"github.com/yanchenm/photo-sync/models"
)

type Claims struct {
	Email string `json:"email"`
	jwt.StandardClaims
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

func generateToken(email, key string, expiry time.Time) (string, error) {
	claims := &Claims{
		Email: email,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expiry.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(key))
}

func (s *Server) authenticate(next func(http.ResponseWriter, *http.Request, models.User)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Read bearer token
		tokens, ok := r.Header["Authorization"]
		if !ok {
			respondWithJSON(w, http.StatusUnauthorized, nil)
			return
		}

		token := strings.TrimPrefix(tokens[0], "Bearer ")
		if token == "" {
			respondWithJSON(w, http.StatusUnauthorized, nil)
			return
		}

		claims := &Claims{}
		accessToken, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
			// Validate signing algorithm is expected
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return []byte(os.Getenv("ACCESS_TOKEN_KEY")), nil
		})

		if err != nil || !accessToken.Valid {
			respondWithJSON(w, http.StatusUnauthorized, nil)
			return
		}

		next(w, r, models.User{Email: claims.Email})
	}
}

func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	user := models.User{}
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&user); err != nil {
		logErrorAndRespond(w, http.StatusBadRequest, "invalid request payload", err)
		return
	}

	defer r.Body.Close()

	if user.Email == "" || user.Password == "" {
		logErrorAndRespond(w, http.StatusBadRequest, "missing required values", nil)
		return
	}

	dbUser, err := s.DB.GetUserFromEmail(user.Email)
	if err != nil {
		respondWithJSON(w, http.StatusUnauthorized, nil)
		return
	}

	if !dbUser.VerifyPassword(user.Password) {
		respondWithJSON(w, http.StatusUnauthorized, nil)
		return
	}

	accessTokenExpiration := time.Now().Add(15 * time.Minute)
	accessTokenString, err := generateToken(user.Email, os.Getenv("ACCESS_TOKEN_KEY"), accessTokenExpiration)

	if err != nil {
		logErrorAndRespond(w, http.StatusInternalServerError, "failed to get tokens", err)
		return
	}

	refreshTokenExpiration := time.Now().Add(14 * 24 * time.Hour)
	refreshTokenString, err := generateToken(user.Email, os.Getenv("REFRESH_TOKEN_KEY"), refreshTokenExpiration)

	if err != nil {
		logErrorAndRespond(w, http.StatusInternalServerError, "failed to get tokens", err)
		return
	}

	err = s.DB.AddToken(models.RefreshToken{
		Email: user.Email,
		Token: refreshTokenString,
	})

	if err != nil {
		logErrorAndRespond(w, http.StatusInternalServerError, "failed to register new token", err)
	}

	dbUser.BeforeSend()
	response := LoginResponse{
		Token: accessTokenString,
		User:  dbUser,
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    refreshTokenString,
		Expires:  refreshTokenExpiration,
		HttpOnly: true,
	})
	respondWithJSON(w, http.StatusOK, response)
}

func (s *Server) refreshAuth(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("refresh")
	if err != nil {
		respondWithJSON(w, http.StatusUnauthorized, nil)
		return
	}

	refreshTokenString := c.Value
	claims := &Claims{}

	refreshToken, err := jwt.ParseWithClaims(refreshTokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Validate signing algorithm is expected
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(os.Getenv("REFRESH_TOKEN_KEY")), nil
	})

	isRevoked := !s.DB.TokenValid(models.RefreshToken{
		Email: claims.Email,
		Token: refreshTokenString,
	})

	if err != nil || !refreshToken.Valid || isRevoked {
		respondWithJSON(w, http.StatusUnauthorized, nil)
		return
	}

	accessTokenExpiration := time.Now().Add(15 * time.Minute)
	accessTokenString, err := generateToken(claims.Email, os.Getenv("ACCESS_TOKEN_KEY"), accessTokenExpiration)

	if err != nil {
		logErrorAndRespond(w, http.StatusInternalServerError, "failed to get tokens", err)
		return
	}

	refreshTokenExpiration := time.Now().Add(14 * 24 * time.Hour)
	newRefreshTokenString, err := generateToken(claims.Email, os.Getenv("REFRESH_TOKEN_KEY"), refreshTokenExpiration)

	if err != nil {
		logErrorAndRespond(w, http.StatusInternalServerError, "failed to get tokens", err)
		return
	}

	err = s.DB.DeleteToken(models.RefreshToken{
		Email: claims.Email,
		Token: refreshTokenString,
	})

	if err != nil {
		logErrorAndRespond(w, http.StatusInternalServerError, "failed to remove old token", err)
		return
	}

	err = s.DB.AddToken(models.RefreshToken{
		Email: claims.Email,
		Token: newRefreshTokenString,
	})

	if err != nil {
		logErrorAndRespond(w, http.StatusInternalServerError, "failed to register new token", err)
		return
	}

	user, err := s.DB.GetUserFromEmail(claims.Email)
	if err != nil {
		logErrorAndRespond(w, http.StatusInternalServerError, "failed to get user", err)
		return
	}

	user.BeforeSend()
	response := LoginResponse{
		Token: accessTokenString,
		User:  user,
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    newRefreshTokenString,
		Expires:  refreshTokenExpiration,
		HttpOnly: true,
	})
	respondWithJSON(w, http.StatusOK, response)
}

func (s *Server) logout(w http.ResponseWriter, r *http.Request, user models.User) {
	c, err := r.Cookie("refresh")
	if err != nil {
		logErrorAndRespond(w, http.StatusBadRequest, "no refresh token received", err)
		return
	}

	refreshTokenString := c.Value
	refreshToken := models.RefreshToken{
		Email: user.Email,
		Token: refreshTokenString,
	}

	// Invalidate the refresh token
	if err := s.DB.DeleteToken(refreshToken); err != nil {
		logErrorAndRespond(w, http.StatusInternalServerError, "failed to unregister token", err)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    "",
		MaxAge:   0,
		HttpOnly: true,
	})
	respondWithJSON(w, http.StatusOK, nil)
}

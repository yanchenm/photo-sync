package server

import (
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
			_ = respondWithJSON(w, http.StatusUnauthorized, nil)
			return
		}

		token := strings.TrimPrefix(tokens[0], "Bearer ")
		if token == "" {
			_ = respondWithJSON(w, http.StatusUnauthorized, nil)
			return
		}

		claims := &Claims{}
		accessToken, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
			// Validate signing algorithm is expected
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return []byte(os.Getenv("REFRESH_TOKEN_KEY")), nil
		})

		if err != nil || !accessToken.Valid {
			_ = respondWithJSON(w, http.StatusUnauthorized, nil)
			return
		}

		next(w, r, models.User{Email: claims.Email})
	}
}

func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		_ = logErrorAndRespond(w, http.StatusBadRequest, "invalid request payload", err)
		return
	}

	email := r.FormValue("email")
	password := r.FormValue("password")

	if email == "" || password == "" {
		_ = logErrorAndRespond(w, http.StatusBadRequest, "missing required values", nil)
		return
	}

	user, err := s.DB.GetUserFromEmail(email)
	if err != nil {
		_ = respondWithJSON(w, http.StatusUnauthorized, nil)
		return
	}

	if !user.VerifyPassword(password) {
		_ = respondWithJSON(w, http.StatusUnauthorized, nil)
		return
	}

	accessTokenExpiration := time.Now().Add(15 * time.Minute)
	accessTokenString, err := generateToken(email, os.Getenv("ACCESS_TOKEN_KEY"), accessTokenExpiration)

	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to get tokens", err)
		return
	}

	refreshTokenExpiration := time.Now().Add(14 * 24 * time.Hour)
	refreshTokenString, err := generateToken(email, os.Getenv("REFRESH_TOKEN_KEY"), refreshTokenExpiration)

	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to get tokens", err)
		return
	}

	err = s.DB.AddToken(models.RefreshToken{
		Email: email,
		Token: refreshTokenString,
	})

	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to register new token", err)
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    refreshTokenString,
		Expires:  refreshTokenExpiration,
		HttpOnly: true,
	})
	_ = respondWithJSON(w, http.StatusOK, map[string]string{"token": accessTokenString})
}

func (s *Server) refreshAuth(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("refresh")
	if err != nil {
		_ = respondWithJSON(w, http.StatusUnauthorized, nil)
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
		_ = respondWithJSON(w, http.StatusUnauthorized, nil)
		return
	}

	accessTokenExpiration := time.Now().Add(15 * time.Minute)
	accessTokenString, err := generateToken(claims.Email, os.Getenv("ACCESS_TOKEN_KEY"), accessTokenExpiration)

	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to get tokens", err)
		return
	}

	refreshTokenExpiration := time.Now().Add(14 * 24 * time.Hour)
	newRefreshTokenString, err := generateToken(claims.Email, os.Getenv("REFRESH_TOKEN_KEY"), refreshTokenExpiration)

	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to get tokens", err)
		return
	}

	err = s.DB.DeleteToken(models.RefreshToken{
		Email: claims.Email,
		Token: refreshTokenString,
	})

	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to remove old token", err)
		return
	}

	err = s.DB.AddToken(models.RefreshToken{
		Email: claims.Email,
		Token: newRefreshTokenString,
	})

	if err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to register new token", err)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    newRefreshTokenString,
		Expires:  refreshTokenExpiration,
		HttpOnly: true,
	})
	_ = respondWithJSON(w, http.StatusOK, map[string]string{"token": accessTokenString})
}

func (s *Server) logout(w http.ResponseWriter, r *http.Request, user models.User) {
	c, err := r.Cookie("refresh")
	if err != nil {
		_ = logErrorAndRespond(w, http.StatusBadRequest, "no refresh token received", err)
		return
	}

	refreshTokenString := c.Value
	refreshToken := models.RefreshToken{
		Email: user.Email,
		Token: refreshTokenString,
	}

	// Invalidate the refresh token
	if err := s.DB.DeleteToken(refreshToken); err != nil {
		_ = logErrorAndRespond(w, http.StatusInternalServerError, "failed to unregister token", err)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    "",
		MaxAge:   0,
		HttpOnly: true,
	})
	_ = respondWithJSON(w, http.StatusOK, nil)
}

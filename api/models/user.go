package models

import "golang.org/x/crypto/bcrypt"

type User struct {
	Email     string `json:"email"`
	Name      string `json:"name"`
	Password  string `json:"password"`
	CreatedAt string `json:"created_at"`
}

func (user *User) HashPassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)
	return nil
}

func (user *User) VerifyPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	return err == nil
}

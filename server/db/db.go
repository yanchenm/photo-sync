package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
)

var (
	HOST = os.Getenv("POSTGRES_HOST")
	PORT = os.Getenv("POSTGRES_PORT")
)

type Database struct {
	Conn *sql.DB
}

func Initialize(username, password, database string) (Database, error) {
	db := Database{}
	dataSource := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		HOST, PORT, username, password, database)

	conn, err := sql.Open("postgres", dataSource)
	if err != nil {
		return db, err
	}

	db.Conn = conn
	err = db.Conn.Ping()
	if err != nil {
		return db, err
	}

	log.Println("Database connection established.")
	return db, nil
}

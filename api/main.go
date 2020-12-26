package main

import (
	"fmt"
	"github.com/yanchenm/photo-sync/server"
	"log"
	"os"
)

func main() {
	s, err := server.Initialize(os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASSWORD"), os.Getenv("POSTGRES_DB"))
	if err != nil {
		log.Fatal(fmt.Sprintf("error initializing server: %s", err))
	}

	s.Run(":8080")
}

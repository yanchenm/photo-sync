package main

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/gorillamux"

	"github.com/yanchenm/photo-sync/server"
)

var lambdaAdapter *gorillamux.GorillaMuxAdapter

func init() {
	log.Printf("lambda cold start")
	s, err := server.Initialize(os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASSWORD"), os.Getenv("POSTGRES_DB"))
	if err != nil {
		log.Fatalf("error initializing server: %s", err)
	}

	lambdaAdapter = gorillamux.New(s.Router)
}

func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return lambdaAdapter.ProxyWithContext(ctx, req)
}

func main() {
	lambda.Start(Handler)
}

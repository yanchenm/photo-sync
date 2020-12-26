FROM golang:1.15.6-alpine3.12 as builder
RUN mkdir /app
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o build/photo-sync .

FROM alpine
RUN apk add --no-cache ca-certificates && update-ca-certificates
COPY --from=builder /app/build/photo-sync /usr/bin/photo_sync
EXPOSE 8080 8080
ENTRYPOINT ["/usr/bin/photo_sync"]
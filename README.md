# photo-sync
---

A cloud storage and sharing solution for your photo library – [photos.runny.cloud](https://photos.runny.cloud)

![home page](https://i.imgur.com/ePJAaY4.png)

## Features
---
- :camera: &nbsp; Responsive UI to show off all your photos
- :cloud: &nbsp; Storage you can trust – backed by Amazon S3
- :mag: &nbsp; Uncompressed, full-quality image always available to download
- :file_cabinet: &nbsp; Curate your collection using albums (coming soon)
- :unlock: &nbsp; Securely share photos and albums with other users and the public

## Tech Stack
---
### Server
- Go
- PostgreSQL
- AWS EC2
- AWS S3 (photo storage)
- AWS CloudFront (content delivery)
- Caddy (reverse proxy)
- Docker

### Web Client
- Typescript
- React
- Redux
- TailwindCSS

## Try It
---
The project is currently hosted at [photos.runny.cloud](https://photos.runny.cloud). Account creation is currently disabled so please feel free to use the public test account below or reach out to me directly.

```
Email: test@runny.cloud
Password: photo-sync
```

You can also try hosting this project yourself by cloning the repository. You will need to set up an S3 bucket and create a `.env` file with the proper configurations in the `api/` directory. You will also need to create your own `Caddyfile` if you wish to use Caddy.

The rest of the setup should be fairly straightforward using `npm` and `docker-compose`.

```shell
cd client
npm install && npm start   # To run the web client locally in development mode

cd ../api
docker-compose up --build  # To run the server locally in development mode
```
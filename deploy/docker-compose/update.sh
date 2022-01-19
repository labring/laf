docker pull lafyun/app-service:latest
docker-compose pull
docker-compose down
docker-compose up -d
docker-compose logs -f --tail 1000
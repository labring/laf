# Warning: just for development phase, will be move to github action in future.



docker buildx build --platform linux/amd64,linux/arm64 --push -t docker.io/lafyun/laf-server:dev -f Dockerfile .

# docker buildx build --platform linux/amd64,linux/arm64 --push -t ghcr.io/labring/laf-server:dev -f Dockerfile .
# Warning: just for development phase, will be move to github action in future.

# get version from package.json
version=$(node -p "require('./package.json').version")

docker buildx build --platform linux/amd64,linux/arm64 --push -t docker.io/lafyun/server:$version -f Dockerfile .
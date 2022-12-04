
# Warning: just for development phase, will be move to github action in future.

# get version from package.json
version=$(node -p "require('./package.json').version")

# build main image
docker buildx build --platform linux/amd64,linux/arm64 --push -t docker.io/lafyun/runtime-node:$version -f Dockerfile .

# build init image
docker buildx build --platform linux/amd64,linux/arm64 --push -t docker.io/lafyun/runtime-node-init:$version -f Dockerfile.init .
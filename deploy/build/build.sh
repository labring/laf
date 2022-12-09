sh ./pre-build.sh

IMAGE=docker.io/lafyun/laf
VERSION=dev
sealos build -t $IMAGE:$VERSION-arm64 --platform linux/arm64 -f Kubefile  .
sealos build -t $IMAGE:$VERSION-amd64 --platform linux/amd64 -f Kubefile  .
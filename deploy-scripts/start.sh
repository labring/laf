# create a docker network that services connect with each other (mongo, system server, app services)
docker network create laf_shared_network --driver bridge || true

docker-compose up -d
docker-compose logs -f --tail 1000
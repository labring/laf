
mkdir backup || true
source .env

docker-compose exec mongo sh -c \
  'exec mongodump --archive -u $MONGODB_USERNAME -p $MONGODB_PASSWORD -d $MONGODB_DATABASE' \
  > ./backup/db_$SYS_DB-$(date +%Y%m%d%H%M%S).archive

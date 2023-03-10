export TASKLIST_HOST_URI=mongodb://localhost
export TASKLIST_DB_NAME=test
export TASKLIST_COLL_NAME=tasklist

npm run build && node --enable-source-maps $(dirname "$0")/../../dist/backup/test.js

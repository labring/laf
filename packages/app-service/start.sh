#!/bin/sh

echo "****** init start ******"
node ./scripts/init.js
echo "****** init end *******"

# source .env
echo "****** start service: node $FLAGS --experimental-fetch ./dist/index.js *******"
exec node $FLAGS ./scripts/start.js
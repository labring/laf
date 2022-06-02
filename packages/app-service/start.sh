#!/bin/sh

echo "****** init start ******"
node ./scripts/init.js
echo "****** init end *******"

# source .env
echo "****** start service: node $FLAGS ./dist/index.js *******"
exec node $FLAGS ./scripts/start.js
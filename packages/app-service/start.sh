#!/bin/sh

echo "****** init start ******"
node ./dist/init.js
echo "****** init end *******"

# source .env
echo "****** start service: node $FLAGS ./dist/index.js *******"
exec node $FLAGS ./dist/index.js
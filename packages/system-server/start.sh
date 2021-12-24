#!/bin/sh

echo "****** init start ******"
node ./dist/init.js
echo "****** init end *******"

# source .env
echo "****** start service: node ./dist/index.js *******"
exec node ./dist/index.js
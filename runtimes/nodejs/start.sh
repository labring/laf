#!/bin/sh

# echo "****** init start ******"
# node ./dist/init.js
# echo "****** init end *******"

# source .env
echo "****** start service: node $FLAGS --expose-internals --experimental-fetch ./dist/index.js *******"
exec node $FLAGS --expose-internals --experimental-fetch ./dist/index.js
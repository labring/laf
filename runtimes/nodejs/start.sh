#!/bin/sh

# source .env
echo "****** start service: node $FLAGS --experimental-fetch ./dist/index.js *******"
exec node $FLAGS --experimental-fetch ./dist/index.js
#!/bin/sh

# source .env
echo "****** start service: node $FLAGS --experimental-vm-modules  --experimental-fetch ./dist/index.js *******"
exec node $FLAGS --experimental-vm-modules  --experimental-fetch ./dist/index.js
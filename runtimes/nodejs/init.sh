#!/bin/sh

# echo "****** init start ******"
set -e
node ./dist/init.js
cp -r /app/* /tmp/app
# echo "****** init end *******"

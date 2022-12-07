#!/bin/sh

# echo "****** init start ******"
node ./dist/init.js
cp -r /app/* /tmp/app
# echo "****** init end *******"

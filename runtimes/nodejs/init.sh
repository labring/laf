#!/bin/sh

set -e
# node ./dist/init.js

# skip init if $DEPENDENCIES is empty
if [ -z "$DEPENDENCIES" ]; then
  echo "No dependencies to install."
  cp -r /app/* /tmp/app
  exit 0
fi

echo "npm install $DEPENDENCIES $NPM_INSTALL_FLAGS"
npm install $DEPENDENCIES $NPM_INSTALL_FLAGS
cp -r /app/* /tmp/app

#!/bin/sh

set -e
# node ./dist/init.js

# npm init
echo "npm init -y"
npm init -y

# skip init if $DEPENDENCIES is empty
if [ -z "$DEPENDENCIES" ]; then
  echo "No dependencies to install."
  exit 0
fi

echo "npm install $DEPENDENCIES $NPM_INSTALL_FLAGS"
npm install $DEPENDENCIES $NPM_INSTALL_FLAGS

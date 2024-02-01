#!/bin/sh

ln -s $CUSTOM_DEPENDENCY_BASE_PATH/node_modules $PWD/functions/node_modules > /dev/null 2>&1 

# generate package.json
(
  cd $CUSTOM_DEPENDENCY_BASE_PATH
  echo '
{
  "scripts": {
    "postinstall": "sh /app/post-install.sh"
  }
}' > package.json
  npm install $NPM_INSTALL_FLAGS
)

# source .env
echo "****** start service: node $FLAGS --experimental-vm-modules  --experimental-fetch ./dist/index.js *******"
exec node $FLAGS --experimental-vm-modules  --experimental-fetch ./dist/index.js
#!/bin/sh

set -e

# skip init if $DEPENDENCIES is empty and $LF_NODE_MODULES_CACHE is not `always`
if [ -z "$DEPENDENCIES" ] && [ "$LF_NODE_MODULES_CACHE" != "always" ]; then
  echo "No dependencies to install."
  exit 0
fi

### get node_modules cache ###
# if $NODE_MODULES_URL is not empty
if [ -n "$NODE_MODULES_PULL_URL" ]; then
  echo "Downloading node_modules from $NODE_MODULES_PULL_URL"

  # get start time
  start_time=$(date +%s)

  # temporarily disable set -e
  set +e

  # download node_modules.tar and untar to `node_modules`
  curl -sSfL $NODE_MODULES_PULL_URL -o node_modules.tar

  end_time=$(date +%s)

  # if error
  if [ $? -ne 0 ]; then
    echo "Failed to download node_modules cache."
  else
    elapsed_time=$(expr $end_time - $start_time)
    echo "Downloaded node_modules.tar in $elapsed_time seconds."

    # untar node_modules.tar
    tar -xf node_modules.tar -C .

    # check tar exit code
    if [ $? -ne 0 ]; then
      echo "Failed to extract node_modules cache."
    else
      end_time_2=$(date +%s)
      elapsed_time_2=$(expr $end_time_2 - $end_time)
      echo "Extracted node_modules cache in $elapsed_time_2 seconds."
    fi
  fi

  # re-enable set -e
  set -e
else
  echo "No node_modules cache found, continuing installation."
fi

# if $LF_NODE_MODULES_CACHE is `always`
if [ "$LF_NODE_MODULES_CACHE" = "always" ]; then
  echo "LF_NODE_MODULES_CACHE is set to 'always', skipping dependency check and install."
  exit 0
fi

### dependency check ###
CACHED_DEPENDENCIES=""
# if node_modules/.dependencies exists
if [ -f "node_modules/.dependencies" ]; then
  CACHED_DEPENDENCIES=`cat node_modules/.dependencies`
fi

echo "Cached dependencies: $CACHED_DEPENDENCIES"
echo "Dependencies to install: $DEPENDENCIES"

# if $CACHED_DEPENDENCIES is equal to $DEPENDENCIES
if [ "$CACHED_DEPENDENCIES" = "$DEPENDENCIES" ]; then
  echo "No dependencies changed since last cache build."
  exit 0
else
  echo "Dependencies changed since last cache build."
fi


### npm install $DEPENDENCIES ###
start_time=$(date +%s)
echo "npm install $DEPENDENCIES $NPM_INSTALL_FLAGS"
npm install $DEPENDENCIES $NPM_INSTALL_FLAGS
end_time=$(date +%s)
elapsed_time=$(expr $end_time - $start_time)
echo "Installed dependencies in $elapsed_time seconds."

### cache node_modules ###
# if $NODE_MODULES_PUSH_URL is not empty
if [ -n "$NODE_MODULES_PUSH_URL" ]; then
  # temporarily disable set -e
  set +e

  start_time=$(date +%s)
  echo $DEPENDENCIES > node_modules/.dependencies
  echo "Uploading node_modules to $NODE_MODULES_PUSH_URL"

  # tar `node_modules` to node_modules.tar
  tar -cf node_modules.tar ./node_modules

  end_time_1=$(date +%s)
  elapsed_time=$(expr $end_time_1 - $start_time)
  echo "Compressed node_modules in $elapsed_time seconds."

  # upload node_modules.tar to $NODE_MODULES_PUSH_URL
  curl -sSfL -X PUT -T node_modules.tar $NODE_MODULES_PUSH_URL


  if [ $? -ne 0 ]; then
    echo "Failed to upload node_modules cache."
  else
    end_time_2=$(date +%s)
    elapsed_time_2=$(expr $end_time_2 - $end_time)
    echo "Uploaded node_modules.tar in $elapsed_time_2 seconds."
  fi

  # re-enable set -e
  set -e
fi

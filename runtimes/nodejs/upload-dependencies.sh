### cache node_modules ###
# if $NODE_MODULES_PUSH_URL is not empty
if [ -n "$NODE_MODULES_PUSH_URL" ]; then
  NODE_MODULES_PATH=$1
  # temporarily disable set -e
  set +e

  start_time=$(date +%s)
  echo $DEPENDENCIES > $NODE_MODULES_PATH/node_modules/.dependencies
  echo "Uploading node_modules to $NODE_MODULES_PUSH_URL"

  # tar `node_modules` to node_modules.tar
  tar -cf $NODE_MODULES_PATH/node_modules.tar -C $NODE_MODULES_PATH node_modules

  end_time_1=$(date +%s)
  elapsed_time=$(expr $end_time_1 - $start_time)
  echo "Compressed node_modules in $elapsed_time seconds."

  # upload node_modules.tar to $NODE_MODULES_PUSH_URL
  curl -sSfL -X PUT -T $NODE_MODULES_PATH/node_modules.tar $NODE_MODULES_PUSH_URL


  if [ $? -ne 0 ]; then
    echo "Failed to upload node_modules cache."
  else
    end_time_2=$(date +%s)
    elapsed_time_2=$(expr $end_time_2 - $end_time_1)
    echo "Uploaded node_modules.tar in $elapsed_time_2 seconds."
  fi

  # re-enable set -e
  set -e
fi
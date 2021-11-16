#!/bin/sh

sh /scripts/auto_envsubst.sh

exec /usr/bin/openresty -g "daemon off;"
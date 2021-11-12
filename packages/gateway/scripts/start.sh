#! /bin/sh

sh /scripts/auto_envsubst.sh

/usr/bin/openresty -g "daemon off;"
#!/bin/sh

conf_dir=/conf.${SERVICE_DRIVER:-docker}

template_dir="${NGINX_ENVSUBST_TEMPLATE_DIR:-/etc/nginx/templates}"

cp -n ${conf_dir}/system.conf /etc/nginx/templates/system.conf.template || true
cp -n ${conf_dir}/app.conf /etc/nginx/templates/app.conf.template || true
cp -n ${conf_dir}/fs-proxy.conf /etc/nginx/templates/fs-proxy.conf.template || true

sh /scripts/auto_envsubst.sh

exec /usr/bin/openresty -g "daemon off;"
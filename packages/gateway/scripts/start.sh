#!/bin/sh

conf_dir=/conf.${SERVICE_DRIVER:-docker}

template_dir="${NGINX_ENVSUBST_TEMPLATE_DIR:-/etc/nginx/templates}"

echo "template_dir: " $template_dir
echo "conf_dir: " $conf_dir

rm -rf $template_dir || true
mkdir -p $template_dir

cp -n ${conf_dir}/system.conf ${template_dir}/system.conf.template || true
cp -n ${conf_dir}/app.conf ${template_dir}/app.conf.template || true
cp -n ${conf_dir}/fs-proxy.conf ${template_dir}/fs-proxy.conf.template || true
cp -n ${conf_dir}/oss.conf ${template_dir}/oss.conf.template || true

sh /scripts/auto_envsubst.sh

exec /usr/bin/openresty -g "daemon off;"
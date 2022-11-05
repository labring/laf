#!/usr/bin/env bash
# Intro: Run this script before building the image.

abs_dir=$(pwd)/$(dirname "$0")
controllers_dir=$abs_dir/../../controllers

# copy controllers' manifests yaml files to build/controllers/manifests

mkdir -p $abs_dir/manifests

matrix=(application database gateway instance oss runtime)

for i in "${matrix[@]}"
do
    cp ${controllers_dir}/${i}/deploy/manifests/deploy.yaml ${abs_dir}/manifests/laf-${i}-controller.yaml
done
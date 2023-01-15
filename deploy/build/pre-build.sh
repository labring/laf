#!/usr/bin/env bash
# Intro: Run this script before building the image.

abs_dir=$(pwd)/$(dirname "$0")
controllers_dir=$abs_dir/../../core/controllers

mkdir -p $abs_dir/manifests

cp ${controllers_dir}/gateway/deploy/manifests/deploy.yaml ${abs_dir}/manifests/laf-gateway-controller.yaml

#!/usr/bin/env sh
# Intro: Run this script before building the image.

name=casdoor

abs_dir=$(pwd)/$(dirname "$0")
chart_dir=$abs_dir/../../charts/$name

# copy charts here
mkdir -p $abs_dir/charts
set -x
cp -r $chart_dir $abs_dir/charts
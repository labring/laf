#!/usr/bin/env sh

set -e

cd ./docs/.vitepress/dist
rm -rf .git
git init
git add -A
git commit -m "deploy"

git push -f git@github.com:Maslow/laf.github.io.git main

cd -
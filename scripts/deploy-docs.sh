#!/usr/bin/env sh

set -e

cd ./docs/.vitepress/dist
rm -rf .git
git init
git add -A
git commit -m "deploy"

git push -f git@github.com:lafjs/lafjs.github.io.git main

cd -
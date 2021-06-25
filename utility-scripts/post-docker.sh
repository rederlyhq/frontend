#!/usr/bin/env sh
[ ! -d /docker-output ] && echo 'Missing /docker-output' && exit 1
cp -r build /docker-output
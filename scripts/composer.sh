#!/usr/bin/env sh

set -eu

COMPOSER_IMAGE='composer:2.9.5'

exec docker run --rm \
    --user "$(id -u):$(id -g)" \
    --volume "${PWD}:/app" \
    --workdir /app \
    "${COMPOSER_IMAGE}" "$@"

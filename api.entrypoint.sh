#!/usr/bin/env bash

set -e

yarn install
yarn db:init
yarn db:seed

exec "$@"

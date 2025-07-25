#! /bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting clean-up..."

yarn nx reset
yarn cache clean

find apps/ libs/ -name "dist" -o -name "test-output" -type d | xargs rm -fr

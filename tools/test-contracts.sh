#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf .testbuild
mkdir -p .testbuild
./node_modules/.bin/tsc src/netmirrorProvider.ts --module commonjs --target es2022 --lib es2022,dom --outDir .testbuild --skipLibCheck
node --test tests/provider.test.cjs

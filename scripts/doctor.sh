#!/usr/bin/env bash
set -euo pipefail
echo "Repo health check v7.23"
echo "- Node version: $(node -v || echo 'node missing')"
echo "- Git branch: $(git branch --show-current || echo 'no git')"
echo "- Docker: $(docker --version 2>/dev/null || echo 'docker missing')"

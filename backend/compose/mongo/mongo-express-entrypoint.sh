#!/bin/bash
set -e

# 1. Log in to Infisical
export INFISICAL_TOKEN=$(infisical login \
    --method=universal-auth \
    --client-id="${INFISICAL_CLIENT_ID}" \
    --client-secret="${INFISICAL_CLIENT_SECRET}" \
    --silent --plain)

# 3. Start mongo-express
# We use 'tini' because the base image uses it to manage the Node.js process
exec infisical run --projectId 02379918-e5ad-4477-b182-a2e2fe0ed838 --recursive -- /sbin/tini -- /docker-entrypoint.sh mongo-express
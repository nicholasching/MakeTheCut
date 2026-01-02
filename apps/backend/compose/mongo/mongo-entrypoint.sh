#!/bin/bash
set -e

# 1. Log in to Infisical to get a short-lived access token
# We use Universal Auth (Machine Identity) for production
if [ -z "$INFISICAL_CLIENT_ID" ] || [ -z "$INFISICAL_CLIENT_SECRET" ]; then
    echo "ERROR: INFISICAL_CLIENT_ID and INFISICAL_CLIENT_SECRET must be set"
    exit 1
fi

export INFISICAL_TOKEN=$(infisical login \
    --method=universal-auth \
    --client-id="${INFISICAL_CLIENT_ID}" \
    --client-secret="${INFISICAL_CLIENT_SECRET}" \
    --silent --plain) || {
    echo "ERROR: Failed to authenticate with Infisical. Check your credentials."
    exit 1
}

# 3. Use 'exec' to replace the shell with Infisical
# This ensures signal propagation (SIGTERM) works correctly for Mongo
exec infisical run --projectId 02379918-e5ad-4477-b182-a2e2fe0ed838 --recursive -- /usr/local/bin/docker-entrypoint.sh "$@"
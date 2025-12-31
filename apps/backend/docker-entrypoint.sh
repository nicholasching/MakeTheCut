#!/bin/sh
set -e

# Function to handle shutdown for dev mode
cleanup() {
  echo "Received SIGTERM, shutting down..."
  kill -TERM "$child_pid" 2>/dev/null
}

trap cleanup TERM INT

# 1. Log in to Infisical to get a short-lived access token
# We use Universal Auth (Machine Identity) for production
export INFISICAL_TOKEN=$(infisical login \
    --method=universal-auth \
    --client-id="${INFISICAL_CLIENT_ID}" \
    --client-secret="${INFISICAL_CLIENT_SECRET}" \
    --silent --plain)

# Define the base Infisical command
# --recursive: pulls secrets from subfolders
# -- : separates infisical args from your app command
INFISICAL_CMD="infisical run --env ${NODE_ENV:-prod} --projectId 02379918-e5ad-4477-b182-a2e2fe0ed838 --recursive --"

if [ "$NODE_ENV" = "dev" ]; then
  echo "WARNING: Running in dev environment"
  # Wrap the node process with infisical run
  $INFISICAL_CMD node build/app.js | npx pino-pretty &
  child_pid=$!
  wait "$child_pid"
else
  # Use exec to replace the shell process with Infisical/Node
  # This ensures signals (SIGTERM) go directly to the app
  exec $INFISICAL_CMD node build/app.js
fi
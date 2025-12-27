#!/bin/sh

# Function to handle shutdown
cleanup() {
  echo "Received SIGTERM, shutting down..."
  # Kill all background processes started by this script
  kill -TERM "$child_pid" 2>/dev/null
}

# Trap SIGTERM and SIGINT (Ctrl+C)
trap cleanup TERM INT

if [ "$NODE_ENV" = "dev" ]; then
  # Run the pipe in the background (&) so the script can continue to the 'wait'
  node build/app.js | npx pino-pretty &
  child_pid=$!
  # Wait for the background process to finish
  wait "$child_pid"
else
  # In production, we don't need the background/trap complexity
  # exec is enough because there is no pipe
  exec node build/app.js
fi
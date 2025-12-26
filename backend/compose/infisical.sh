#!/bin/bash

# Function to run on exit
terminate() {
  echo "Receiving SIGTERM. Cleaning up secrets..."
  rm -f /tmp/.env
  exit 0
}

# Trap SIGTERM (sent by 'docker stop') and SIGINT (Ctrl+C)
trap terminate SIGTERM SIGINT

# Start the actual infisical agent process in the background
# Note: We use the path /etc/infisical/agent-config.yaml as mapped in your compose
infisical agent --config /etc/infisical/agent-config.yaml &

# Wait for the background process to finish
wait $!
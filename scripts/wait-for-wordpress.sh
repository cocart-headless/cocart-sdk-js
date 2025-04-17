#!/bin/bash

# Wait for WordPress to be ready
echo "Waiting for WordPress to be ready..."

# Create the test directories if they don't exist
mkdir -p test-plugins
mkdir -p test-setup/plugins

# Check if WordPress is responding
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT+1))
  echo "Attempt $ATTEMPT of $MAX_ATTEMPTS..."
  
  # Try to access WordPress
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
  
  if [ "$response" = "200" ]; then
    echo "WordPress is up and running!"
    exit 0
  elif [ "$response" = "302" ]; then
    echo "WordPress is redirecting, checking redirection target..."
    redirect=$(curl -s -I http://localhost:8080 | grep -i location)
    echo "Redirect: $redirect"
    
    # Check if it's a WordPress-related redirect
    if [[ "$redirect" == *"wp-admin"* || "$redirect" == *"install.php"* ]]; then
      echo "WordPress is initializing..."
      # It's a WordPress redirect, let's continue waiting
    else
      echo "WordPress is up with an unexpected redirect"
      exit 0
    fi
  else
    echo "WordPress is not ready yet (HTTP $response), waiting..."
  fi
  
  sleep 5
done

echo "Timed out waiting for WordPress to be ready"
exit 1 
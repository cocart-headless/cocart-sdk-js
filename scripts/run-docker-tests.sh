#!/bin/bash

# Check if Docker is installed
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Please install Docker to run these tests."
  exit 1
fi

if ! command -v docker-compose >/dev/null 2>&1; then
  echo "Docker Compose is not installed. Please install Docker Compose to run these tests."
  exit 1
fi

# Start Docker containers
echo "Starting Docker containers..."
docker-compose up -d

# Wait for WordPress to be ready
echo "Waiting for WordPress to be ready..."
./scripts/wait-for-wordpress.sh

if [ $? -ne 0 ]; then
  echo "Failed to start WordPress. Stopping containers..."
  docker-compose down
  exit 1
fi

# Run integration tests
echo "Running integration tests..."
DOCKER_TESTING=true npm run test:integration

# Capture the test result
TEST_RESULT=$?

# Stop Docker containers
echo "Stopping Docker containers..."
docker-compose down

# Return the test result
exit $TEST_RESULT 
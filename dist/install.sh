#!/bin/bash

# Update package lists
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Install Docker Compose
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose

chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

# Change to the /opt directory
cd /opt

# Download the docker-compose.yaml file
sudo curl -O https://raw.githubusercontent.com/EJX537/Microgrid/test-deployment/dist/docker-compose.yaml
# Run the services
sudo docker-compose up -d

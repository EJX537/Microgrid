#!/bin/bash

# Update package lists
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Change to the /opt directory
cd /opt

# Download the docker-compose.yaml file
sudo curl -O https://example.com/path/to/docker-compose.yaml

# Run the services
sudo docker-compose up -d

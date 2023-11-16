#!/bin/bash

# Update package lists
sudo apt-get update

# Install Docker
sudo apt-get install -y docker docker-compose

# Change to the /opt directory
cd /opt

# Download the docker-compose.yaml file
sudo curl -O https://raw.githubusercontent.com/EJX537/Microgrid/test-deployment/dist/docker-compose.yaml
# Run the services
sudo docker-compose up -d

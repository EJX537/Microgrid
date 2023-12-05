#!/bin/bash

echo "Installing Microgrid Manager..."

# Check if we are on a Windows system
# Check if we are on a Windows system
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
	# Chocolatey is not installed. Install it
	echo "Install Chocolatey..."
	if ! command -v choco &>/dev/null; then
		echo "Chocolatey not found. Installing now..."
		powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"s
	else
		echo "Chocolatey is already installed."
	fi

	echo "Installing Docker..."
	
	# Install Docker using Chocolatey
	choco install -y docker-desktop

	# Define the full path of the docker-compose executable
	#DOCKER_COMPOSE="C:\Program Files\Docker\Docker\resources\bin\docker-compose.exe"
  export PATH=$PATH:"C:\Program Files\Docker\Docker\resources\bin"

	# Create a new directory in the /Program\ Files directory
	mkdir -p "C:\Program Files\Microgrid Manager"

	# Change to the /Program\ Files directory
	cd "\Program Files\Microgrid Manager"

	# Make a folder for the database
	mkdir "database"

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
	# Update package lists
	sudo apt-get update

	# Install Docker
	sudo apt-get install -y docker docker-compose

	# Create a new directory in the /opt\ Files directory
	mkdir -p /opt/Microgrid\ Manager

	# Change to the /opt directory
	cd /opt/Microgrid\ Manager

	# Make a folder for the database
	mkdir -p /database

else
	# Unsupported.
	echo "Unsupported OS: $OSTYPE"
	exit 1
fi

# Download the docker-compose.yaml file and the update.sh file
curl -O -k https://raw.githubusercontent.com/EJX537/Microgrid/main/deployment/docker-compose.yaml
curl -O -k https://raw.githubusercontent.com/EJX537/Microgrid/main/deployment/update.sh

# Make the update.sh file executable
chmod +x update.sh

# Run the services
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
	start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
	echo "Waiting for Docker to start..."
	while ! docker system info > /dev/null 2>&1; do
    sleep 1
	done
	echo "Docker is now running. Proceeding with docker-compose up..."
	docker-compose up -d
	# "$DOCKER_COMPOSE" up -d

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
	docker-compose up -d
else
	# Unsupported.
	echo "Unsupported OS: $OSTYPE"
	exit 1
fi

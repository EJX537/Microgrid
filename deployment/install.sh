#!/bin/bash

# Check if we are on a Windows system
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
	# This is a Windows system. Check if Chocolatey is installed
	if ! command -v choco &>/dev/null; then
		# Chocolatey is not installed. Install it
		@powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
	fi

	# Install Docker using Chocolatey
	choco install -y docker docker-compose

	# Create a new directory in the /Program\ Files directory
	mkdir -p "\Program Files\Microgrid Manager"

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
	mkdir /opt/Microgrid\ Manager

	# Change to the /opt directory
	cd /opt/Microgrid\ Manager

	# Make a folder for the database
	mkdir /database

else
	# Unsupported.
	echo "Unsupported OS: $OSTYPE"
	exit 1
fi

# Download the docker-compose.yaml file and the update.sh file
curl -O https://raw.githubusercontent.com/EJX537/Microgrid/test-deployment/dist/docker-compose.yaml
curl -O https://raw.githubusercontent.com/EJX537/Microgrid/test-deployment/dist/update.sh

# Make the update.sh file executable
chmod +x update.sh

# Run the services
docker-compose up -d

#!/bin/bash

# Check if we are on a Windows system
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
	# Change to the /Program\ Files directory
	cd "\Program Files"
	del /F /Q docker-compose.yaml

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
	# Change to the /opt directory
	cd /opt
	# Delete the previous docker-compose.yaml file
	rm -f docker-compose.yaml

else
	# Unknown.
	echo "unknown: $OSTYPE"
	exit 1
fi

# Download the docker-compose.yaml file
curl -O https://raw.githubusercontent.com/EJX537/Microgrid/test-deployment/dist/docker-compose.yaml

# Run the services
docker-compose up -d

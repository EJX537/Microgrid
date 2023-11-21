#!/bin/bash

echo "Taking down old docker containers"
docker-compose down -v --remove-orphans

# Wait until all containers are down
while [ "$(docker-compose ps -q)" != "" ]; do
  echo "Waiting for containers to stop..."
  sleep 1
done

# Check if we are on a Windows system
echo "Deleting old docker-compose.yaml"
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
	# Change to the /Program\ Files directory
	cd "\Program Files"
	rm docker-compose.yaml

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
echo "Downloading new docker-compose.yaml"
curl -O -k https://raw.githubusercontent.com/EJX537/Microgrid/test-deployment/dist/docker-compose.yaml

echo "Starting new docker containers"
# Run the services
docker-compose up -d

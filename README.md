# Microgrid
CSE 115D Project

## Why Mircogrid Manager

## Install

### Linux / Unix

```bash
  curl -O https://raw.githubusercontent.com/EJX537/Microgrid/main/deployment/install.sh | bash
```

### Windows

With Git bash:
```bash
curl -O https://raw.githubusercontent.com/EJX537/Microgrid/main/deployment/install.sh && ./install.sh ^C
```

Download the file from [github](https://github.com/EJX537/Microgrid/blob/main/deployment/install.sh)

or download it in powershell using:

```
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/EJX537/Microgrid/main/deployment/install.sh" -OutFile "install.sh"
```

then running it using bash:

Install [WSL(Windows Subsysyem for Linux)](https://www.thewindowsclub.com/how-to-run-sh-or-shell-script-file-in-windows-10)

Or Install it Manually in PowerShell:
```
  # Chocolatey is not installed. Install it
  @powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET   "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"

  # Install Docker using Chocolatey
  choco install -y docker docker-compose

  # Create a new directory in the /Program\ Files directory
  mkdir -p "\Program Files\Microgrid Manager"

	# Change to the /Program\ Files directory
	cd "\Program Files\Microgrid Manager"

	# Make a folder for the database
	mkdir "database"

  # Download the docker-compose.yaml file and the update.sh file
  curl -O https://raw.githubusercontent.com/EJX537/Microgrid/test-deployment/dist/docker-compose.yaml
  curl -O https://raw.githubusercontent.com/EJX537/Microgrid/test-deployment/dist/update.sh

  # Make the update.sh file executable
  chmod +x update.sh

  # Run the services
  docker-compose up -d

```

Finally run the install.sh file

## Update
Update from the web app

or run the update.sh /path/to/Microgrid\ Manager

## Technical Specs

## Tests

## Creidts



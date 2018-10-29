# Transmission on Raspberry Pi as a Docker Container

## Description

The goal of this guide is to create a stateless container running `transmission` that is:

* based on an image built from scratch (well known image + installation) using a Dockerfile.
* stateless, with all interfaces (state information + communication ports) well defined.

### Container Interfaces

`transmission` state information is preserved in the following directories:

* Configuration directory - where `transmission` looks for configuration files. The folder contains:
  * `settings.json` file, there is a sample provided in this repository.
* `download-dir` - where `transmission` saves downloaded data.
  * The location is defined in the `settings.json` file, e.g., `/transmission/downloads`.
* `incomplete-dir` - where `transmission` stores data not yet completely downloaded.
  * The location is defined in the `settings.json` file, e.g., `/transmission/downloads`.
* Watch directory - where `transmission` watches for new .torrent files

`transmission` needs to be able to listen on the following ports:

* 9091 (tcp) - used for accessing the web interface.
* 51413 (tcp & udp) - used for incoming connections for data sharing.

## Prerequisites
* Keep the settings file outside of the container

# Build the docker image
`$ docker build -t home-it/transmission .`

# Create a container
```
$ docker create --name=transmission \
-v /srv/transmission/config:/transmission/config \
-v /media/HDD_XFS_Sgt/Downloads/Torrents:/transmission/downloads \
-v /srv/transmission/watch:/transmission/watch \
-e TGID=$(id -g $USER) -e TUID=$(id -u $USER) \
-p 9091:9091 -p 51413:51413 -p 51413:51413/udp \
home-it/transmission
```

# Run the container
`$ docker start transmission`

# Stop the container
`$ docker stop transmission`

# /config - where transmission stores config files and logs
# /downloads - for downloads
# /watch - watch folder for torrent files
# PGID and PUID - ensure the data volume directory on the host is owned by the same user you specify and it will
# TZ for timezone information

# Resources
* https://github.com/silvinux/transmission-alpine
* https://github.com/ezbiranik/docker-alpine-transmission
* https://github.com/werwolfby-docker/armhf-alpine-transmission

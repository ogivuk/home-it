# Transmission on Raspberry Pi as a Docker Container

## Description

The goal of this guide is to create a stateless container running `transmission`.
In order to achieve that, the interfaces between the container and the host system needs to be properly designed. For example, all state information (e.g., configuration and downloaded data) needs to be stored on the actual host and attached to the container
through volume binding/mounting.

### Container Interfaces

State information:

* Configuration directory - where `transmission` looks for configuration files
* Download directory - where `transmission` saves downloaded data
* Watch directory - where `transmission` watches for new .torrent files

Communication ports:

* 9091/tcp
* 51413/tcp
* 51413/udp



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

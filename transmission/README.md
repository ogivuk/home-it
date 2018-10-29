# Transmission on Raspberry Pi as a Docker Container

2018-10-29, Ognjen Vuković

## Description

`transmission` is a lightweight BitTorrent client which features a variety of user interfaces on top of a cross-platform back-end.

The goal of this guide is to create a stateless container running `transmission` that is:

* based on an image built from scratch (well known image + installation) using a Dockerfile.
* stateless, with all interfaces (state information + communication ports) well defined.

### Container Interfaces

`transmission` state information is preserved in the following directories:

* Configuration directory - where `transmission` looks for configuration files.
  * The directory contains:
    * `settings.json` file, there is a sample provided in this repository.
  * The location of directory:
    * The location can be set in the `TRANSMISSION_HOME` environment variable.
    * If `TRANSMISSION_HOME` is not set, the default location on Unix-based systems is `$HOME/.config/`.
    * The location can also be passed at the run time as the argument `--config-dir`.
* Download directory - where `transmission` saves downloaded data.
  * The location of directory:
    * The location is specified in the `settings.json` configuration file under `download-dir`, e.g., `/transmission/downloads`.
* Incomplete download directory - where `transmission` stores data not yet completely downloaded.
  * The location of directory:
    * The location is specified in the `settings.json` configuration file under `incomplete-dir`.
  * Enabling the directory:
    * The directory is not enabled by default.
    * To enable the directory, `incomplete-dir-enabled` needs to be set to `true` in the `settings.json` configuration file.
* Watch directory - where `transmission` watches for new .torrent files
  * The location of the directory:
    * The location is specified in the `settings.json` configuration file under `watch-dir`, e.g., `transmission/watch-dir`.
  * Enabling the directory:
    * The directory is not enabled by default.
    * TO enable the directory, `watch-dir-enabled` needs to be set to `true` in the `settings.json` configuration file.

`transmission` uses the following TCP and UDP communication ports:

* Incoming/Listening ports:
  * Web interface (TCP)
    * The port number is specified in the configuration file as `rpc-port`
    * The default value is `9091`
  * Incoming connections for data sharing (TCP and UDP)
    * The port number is specified in the configuration file as `peer-port`
    * The default value is `51413`

* Outgoing ports:
  * Outgoing connections to establish connections with other peers (TCP and UDP).
    * The port range is specified in the configuration file as from `peer-port-random-low` to `peer-port-random-high`
    * The default range is `49152` to `65535`

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
* https://github.com/transmission/transmission/wiki/Configuration-Files
* https://github.com/transmission/transmission/wiki/Environment-Variables
* https://github.com/silvinux/transmission-alpine
* https://github.com/ezbiranik/docker-alpine-transmission
* https://github.com/werwolfby-docker/armhf-alpine-transmission

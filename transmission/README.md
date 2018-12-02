# Transmission as a Docker Container

2018-10-29, Ognjen Vuković

## Description

**Transmission** is a lightweight BitTorrent client which features a variety of user interfaces on top of a cross-platform back-end.

The goal of this guide is to create a stateless container running transmission that is:

* based on an image built from scratch (well known image + installation) using a Dockerfile.
* stateless, with all interfaces (state information + communication ports) well defined.

The guide has been verified on:

* Raspberry Pi running Raspbian Lite OS (ARM architecture)
* Ubuntu 18.04 (Intel x64 architecture)

### Container Interfaces

**Transmission state information** is preserved in the following directories:

* **Configuration directory** - where transmission looks for configuration files.
  * The directory contains:
    * `settings.json` file, there is a sample provided in this repository.
    * `torrents/` folder with .torrent files.
  * The location of directory:
    * The location can be set in the `TRANSMISSION_HOME` environment variable.
    * If `TRANSMISSION_HOME` is not set, the default location on Unix-based systems is `$HOME/.config/`.
    * The location can also be passed when starting transmission as the argument `--config-dir`.
* **Download directory** - where transmission saves downloaded data.
  * The location of directory:
    * The location is specified in the `settings.json` configuration file under `download-dir`, e.g., `/transmission/downloads`.
* **Incomplete download directory** - where transmission stores data not yet completely downloaded.
  * The location of directory:
    * The location is specified in the `settings.json` configuration file under `incomplete-dir`.
  * Enabling the directory:
    * The directory is not enabled by default.
    * To enable the directory, `incomplete-dir-enabled` needs to be set to `true` in the `settings.json` configuration file.
* **Watch directory** - where transmission watches for new .torrent files
  * The location of the directory:
    * The location is specified in the `settings.json` configuration file under `watch-dir`, e.g., `transmission/watch-dir`.
  * Enabling the directory:
    * The directory is not enabled by default.
    * TO enable the directory, `watch-dir-enabled` needs to be set to `true` in the `settings.json` configuration file.

**Transmission uses the following TCP and UDP communication ports**:

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

**Handling file ownership and access control**:

* The owner of files created and downloaded by a transmission container is the user specified within the image to execute `ENTRYPOINT`, `RUN`, and `CMD`. The default user is `root` with `UID=0`.
* A proper user should be set in the Docker image for maintaining the consistancy of file ownership and for handling access right in the attached storage where the transmission state and downloaded files are preserved.
* Setting the user:
  * The `USER` instruction in Dockerfile sets the user UID and optionally the user group GID.
  * UID and GID can be passed as build-time variables using the `--build-arg` argument to `docker build`.
  * Note: It is important that the explicit UID/GID are assigned, rather than just user name and group name.

## Prerequisites

* Host running Linux
* Docker installed
* The guide [Install Raspbian with SSH](../raspberry-pi/Install%20Raspbian%20with%20SSH.md) covers the necessary steps for a Raspberry Pi host.

## Step-by-Step Guide

### Prepare Environment

1. Build the docker image based on the provided [Dockerfile](Dockerfile):

    ```shell
    docker build \
      --build-arg TUID=$(id -u $USER) \
      --build-arg TGID=$(id -g $USER) \
      -t home-it/transmission .
    ```
    * `--build-arg TUID=$(id -u $USER)` passes the current user's UID so that all files created by transmission will be owned by the current user.
    * `--build-arg TUID=$(id -u $USER)` passes the current user's GID so that all files created by transmission will be owned by the current user's group.
2. Prepare/create directories on the host

    * If they do not already exist, create directories on the host for storing configuration files, watch files, and downloaded files. Optionally, also create a directory for incomplete files, if a dedicated one is used.
    ```shell
    mkdir -p /path/to/dir/for/transmission/config
    mkdir -p /path/to/dir/for/downloads
    mkdir -p /path/to/dir/for/transmission/watch
    ```
    * replace `/path/to/dir/for/transmission/config` with the actual location of the transmission configuration directory on the host.
    * replace `/path/to/dir/for/downloads` with the actual location where the downloaded files should be saved on the host.
    * replace `/path/to/dir/for/transmission/watch` with the actual location where transmission should watch for torrent files on the host.
3. [Optional] Use the provided `settings.json` file.

    ```shell
    cp settings.json /path/to/dir/for/transmission/config
    ```
    * replace `/path/to/dir/for/transmission/config` with the actual location of the transmission configuration directory on the host.
    * note that the provided configuration **is not secure**. Consider enabling the rpc authentication and the host whitelist.

### Start Transmission

#### On a Docker Host

```shell
docker run -d \
    --name=transmission \
    --restart always \
    --volume /path/to/dir/for/transmission/config:/transmission/config \
    --volume /path/to/dir/for/downloads:/transmission/downloads \
    --volume /path/to/dir/for/transmission/watch:/transmission/watch \
    --publish 9091:9091 -p 51413:51413 -p 51413:51413/udp \
    home-it/transmission
```
* `--name=transmission` names the container as `transmission`, and it can be replaced with another desired name.
* `--restart always` configures the restart policy to always restart the container if it stops.
* `--publish 9091:9091 -p 51413:51413 -p 51413:51413/udp` exposes the required ports.
* Replace `/path/to/dir/for/transmission/config` with the actual location of the transmission configuration directory on the host.
* Replace `/path/to/dir/for/downloads` with the actual location where the downloaded files should be saved on the host.
* Replace `/path/to/dir/for/transmission/watch` with the actual location where transmission should watch for torrent files on the host.
* Optionally, also bind mount the directory for incomplete files, if a dedicated one is used.

#### In a Docker Swarm

```shell
docker service create \
    --name=transmission \
    --mount type=bind,src=/path/to/dir/for/transmission/config,dst=/transmission/config \
    --mount type=bind,src=/path/to/dir/for/downloads,dst=/transmission/downloads \
    --mount type=bind,src=/path/to/dir/for/transmission/watch,dst=/transmission/watch \
    --publish 9091:9091 -p 51413:51413 -p 51413:51413/udp \
    home-it/transmission
```
* `--name=transmission` names the service as `transmission`, and it can be replaced with another desired name.
* Replace `/path/to/dir/for/transmission/config` with the actual location of the transmission configuration directory on the host. This location **needs to be available on all nodes in Docker swarm**, e.g., via network shared storage.
* Replace `/path/to/dir/for/downloads` with the actual location where the downloaded files should be saved on the host. This location **needs to be available on all nodes in Docker swarm**, e.g., via network shared storage.
* Replace `/path/to/dir/for/transmission/watch` with the actual location where transmission should watch for torrent files on the host. This location **needs to be available on all nodes in Docker swarm**, e.g., via network shared storage.
* Optionally, also bind mount the directory for incomplete files, if a dedicated one is used.

## Sources

* https://github.com/transmission/transmission/wiki/Configuration-Files
* https://github.com/transmission/transmission/wiki/Environment-Variables
* https://github.com/silvinux/transmission-alpine
* https://github.com/ezbiranik/docker-alpine-transmission
* https://github.com/werwolfby-docker/armhf-alpine-transmission

# Transmission as a Docker Container

[**Transmission**](https://transmissionbt.com/) is a lightweight, fast, and free BitTorrent client.

The goal of this repository is to provide means to create a stateless container running transmission that is:

* based on an image built from scratch (well known image + installation) using a Dockerfile. The Dockerfile is provided in this repository.
* stateless, with all interfaces (state information + communication ports) well defined. More information about the interfaces can be found below in `Interfaces`.

Supported architectures are:

* **x64** (default) tagged as `:latest` and `:x64`, verified on Ubuntu 18.04 running on Intel x64 architecture.
* **armv7l** (32 bit) tagged as `:armv7l`, verified on Raspberry Pi 3B running Raspbian Lite OS.

## Usage

### Run as a Docker Container

```shell
docker run -d \
    --name=transmission \
    --restart unless-stopped \
    --publish 9091:9091 --publish 51413:51413 --publish 51413:51413/udp \
    --volume /path/to/dir/for/transmission/config:/transmission/config \
    --volume /path/to/dir/for/downloads:/transmission/downloads \
    --volume /path/to/dir/for/transmission/watch:/transmission/watch \
    ogivuk/transmission
```

* `--name=transmission` names the container as `transmission`, and it can be replaced with another desired name.
* `--restart unless-stopped` configures the restart policy to always restart the container if it stops, except when the container is stopped manually.
* `--publish 9091:9091 --publish 51413:51413 --publish 51413:51413/udp` exposes the required ports.
* Replace `/path/to/dir/for/transmission/config` with the actual location of the transmission configuration directory on the host.
* Replace `/path/to/dir/for/downloads` with the actual location where the downloaded files should be saved on the host.
* Replace `/path/to/dir/for/transmission/watch` with the actual location where transmission should watch for torrent files on the host.
* Optionally, also bind mount the directory for incomplete files, if a dedicated one is used.
* Note that the directories and the downloaded files will be **owned by the default user with UID=1000 and GID=1000**. If that's not desired, start by manually building your own image first (see below).

### Run as a Docker Swarm Service

```shell
docker service create \
    --name=transmission \
    --publish 9091:9091 --publish 51413:51413 --publish 51413:51413/udp \
    --mount type=bind,src=/path/to/dir/for/transmission/config,dst=/transmission/config \
    --mount type=bind,src=/path/to/dir/for/downloads,dst=/transmission/downloads \
    --mount type=bind,src=/path/to/dir/for/transmission/watch,dst=/transmission/watch \
    ogivuk/transmission
```

* `--name=transmission` names the service as `transmission`, and it can be replaced with another desired name.
* `--publish 9091:9091 --publish 51413:51413 --publish 51413:51413/udp` exposes the required ports.
* Replace `/path/to/dir/for/transmission/config` with the actual location of the transmission configuration directory on the host. Optionally, you can copy there and use the provided [settings](settings.json) file.
* Replace `/path/to/dir/for/downloads` with the actual location where the downloaded files should be saved on the host.
* Replace `/path/to/dir/for/transmission/watch` with the actual location where transmission should watch for torrent files on the host.
* Optionally, also bind mount the directory for incomplete files, if a dedicated one is used.
* The specified locations **need to be available on all nodes in Docker swarm**, e.g., via network shared storage.
* Note that the directories and the downloaded files will be **owned by the default user with UID=1000 and GID=1000**. If that's not desired, start by manually building your own image first (see below).

### Manually Building the Image

1. Obtain the Dockerfile by cloning the repository or by downloading only the file.
2. Build the docker image based on the provided Dockerfile:

    ```shell
    docker build \
      --build-arg TUID=$(id -u $USER) \
      --build-arg TGID=$(id -g $USER) \
      -t ogivuk/transmission .
    ```

    * `--build-arg TUID=$(id -u $USER)` passes the current user's UID so that all files created by transmission will be owned by the current user.
    * `--build-arg TUID=$(id -u $USER)` passes the current user's GID so that all files created by transmission will be owned by the current user's group.
3. Run as a Docker container or as a Docker Swarm service (see above).

### Settings.json

The github repository provides an example of the `settings.json` file that can be copied to the `config` folder and used by `transmission`. Note that the provided configuration **is not secure**, and you should consider enabling the rpc authentication and the host whitelist.

## Interfaces

This section provides information about all interfaces (state information + communication ports) that should be taken care of to trully run the container as stateless.

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

## External Sources

* https://github.com/transmission/transmission/wiki/Configuration-Files
* https://github.com/transmission/transmission/wiki/Environment-Variables
* https://github.com/silvinux/transmission-alpine
* https://github.com/ezbiranik/docker-alpine-transmission
* https://github.com/werwolfby-docker/armhf-alpine-transmission

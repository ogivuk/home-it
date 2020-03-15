# Transmission Docker Image

[**Transmission**](https://transmissionbt.com/) is a lightweight, fast, and free BitTorrent client.

This repository provides means to create a stateless container running transmission that is:

* based on an image built from scratch (well known image + installation) using a Dockerfile, which is open-source and provided in this repository.
* stateless, with all interfaces (state information + communication ports) well defined. More information about the interfaces can be found below in `Interfaces`.

Supported architectures:

* the image supports multiple architectures: `x86-64` and `arm32`
* the docker manifest is used for multi-platform awareness
* by simply pulling or running `ogivuk/transmission:latest`, the correct image for your architecture will be retreived

| Tag | Transmission Version and Architecture |
| :--- | :----    |
| `:latest` | latest version (2.94) supporting both `x64` and `arm32v7` architectures |
| `:2.94` | version 2.94 supporting both `x64` and `arm32v7` architectures |
| `:2.94-x64` | version 2.94 for `x64` architecture |
| `:2.94-arm32v7` | version 2.94 for `arm32v7` architecture |

## Usage

### Run as a Docker Container

1. Store the transmission config file in folder that will be mounted later.
If you do not have a config file already, you can download one from:

    ``` shell
    mkdir -p ~/Downloads/transmission/config
    cd ~/Downloads/transmission/config
    wget https://raw.githubusercontent.com/ognjenvukovic/home-it/master/transmission/settings.json
    ```

   * this step is necessary as docker volume mount will lose the default config file in the container.
   * in this way you can later edit and preserve the config file.
   * the provided configuration **is not secure**, and you should consider enabling the rpc authentication and the host whitelist.
   * `~/Downloads/transmission/config` is a suggested location of the transmission configuration directory on the host, replace with other if desired.

2. Run a container:

    ```shell
    docker run -d \
        --name=transmission \
        --restart unless-stopped \
        --publish 9091:9091 --publish 51413:51413 --publish 51413:51413/udp \
        --volume ~/Downloads/transmission/config:/transmission/config \
        --volume ~/Downloads/transmission/torrents:/transmission/downloads \
        --volume ~/Downloads/transmission/watch:/transmission/watch \
        ogivuk/transmission
    ```

   * `--name=transmission` names the container as `transmission`, and it can be replaced with another desired name.
   * `--restart unless-stopped` configures the restart policy to always restart the container if it stops, except when the container is stopped manually.
   * `--publish 9091:9091 --publish 51413:51413 --publish 51413:51413/udp` exposes the required ports.
   * `~/Downloads/transmission/config` is a suggested location of the transmission configuration directory on the host, replace with other if desired.
   * `~/Downloads/transmission/torrents` is a suggested location where the downloaded files will be saved on the host, replace with other if desired.
   * `~/Downloads/transmission/watch` is a suggested location where transmission will watch for torrent files on the host, replace with other if desired.
   * Optionally, also bind mount the directory for incomplete files, if a dedicated one is used.
   * Note that the directories and the downloaded files will be **owned by the default user with UID=1000 and GID=1000**. If that's not desired, start by manually building your own image first (see below).

### Run as a Docker Swarm Service

Important: the specified directories **need to be available on all nodes in Docker swarm**, e.g., via network shared storage.

1. Store the transmission config file in folder that is accessible to all Docker Swarm nodes.
If you do not have a config file already, you can download one from:

    ``` shell
    cd /path/to/dir/for/transmission/config
    wget https://raw.githubusercontent.com/ognjenvukovic/home-it/master/transmission/settings.json
    ```

   * Replace `/path/to/dir/for/transmission/config` with the actual location of the transmission configuration directory reachable by all Swarm nodes.

2. Create a service:

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
   * Replace `/path/to/dir/for/transmission/config` with the actual location of the transmission configuration directory reachable by all Swarm nodes.
   * Replace `/path/to/dir/for/downloads` with the actual location where the downloaded files should be saved and that is reachable by all Swarm nodes.
   * Replace `/path/to/dir/for/transmission/watch` with the actual location where transmission should watch for torrent files and that is reachable by all Swarm nodes.
   * Optionally, also bind mount the directory for incomplete files, if a dedicated one is used.
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

## References

* https://github.com/transmission/transmission/wiki/Configuration-Files
* https://github.com/transmission/transmission/wiki/Environment-Variables

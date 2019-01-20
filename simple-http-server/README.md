# Simple HTTP Server

2019-01-20, Ognjen Vuković

## Description

This repository contains instructions on how to set up simple HTTP server, run as a Docker container.

Simple HTTP server:
* can be used when the goal is to have a simple server to serve files in a local network.
* should not be used to serve files over the Internet, as it provides no security protection.

Simple HTTP server is established by:
* starting a Docker container running the Python3 http.server module,
* exposing the port on which the module listens,
* and by volume binding the directory with the files shared by the HTTP server.

Simple HTTP server is run as Docker container that:
* is stateless, with all interfaces (state information + communication ports) well defined, and
* can be built using the provided [Dockerfile](Dockerfile),
* can be also run as a Docker Swarm service.

### Container Interfaces

**State information**:

* Directory with shared files:
    * The directory Files that the HTTP server serves.
    * The directory is located at `/app/share/` in the container.
 
**Communication ports**:

* Incoming/Listening ports:
    * HTTP server is listening on a TCP port for receiving request. The default port is `8000`.

## Prerequisites

* Host running Linux
* Docker installed
* The guide [Install Raspbian with SSH](../raspberry-pi/Install%20Raspbian%20with%20SSH.md) covers the necessary steps for a Raspberry Pi host.

## Step-by-Step Guide

### Prepare the environment

1. Clone the repository where the HTTP server will run, and go to this directory:

    ```shell
    cd simple-http-server
    ```
2. Build a Docker image based on the provided [Dockerfile](Dockerfile):

    ```shell
    docker build -t home-it/simple-http-server .
    ```
3. Create a directory for the shared files:
    * If it does not already exist, create a directory for shared files:

    ```shell
    mkdir -p /path/to/dir/with/shared/files
    ```
    * replace `/path/to/dir/with/shared/files` with the actual location.

### Run the server

* On a Docker Host:

    ```shell
    docker run -d \
        --name http-server \
        --restart=always \
        --volume /path/to/dir/with/shared/files:/app/share \
        --publish 8000:8000 \
        home-it/simple-http-server
    ```
    * Replace `/path/to/dir/with/shared` with the appropriate path on the host.
    * `http-server` in `--name http-server` can be replaced with another desired name for the container.
    * `--publish 8000:8000` exposes the 8000 port on the host. The exposed port on the host can be changed by changing the first port (left of :).

* In a Docker Swarm:

    ```shell
    docker service create \
        --name=http-server \
        --mount type=bind,src=/path/to/dir/with/shared,dst=/app/share \
        --publish 8000:8000 \
        home-it/simple-http-server
    ```
    * Replace `/path/to/dir/with/shared` with the appropriate path on the host.
    * `http-server` in `--name=http-server` can be replaced with another desired name for the container.
    * `--publish 8000:8000` exposes the 8000 port on the host. The exposed port on the host can be changed by changing the first port (left of :).

## Sources:
* https://stackoverflow.com/questions/51016945/create-a-dockerfile-that-runs-a-python-http-server-to-display-an-html-file
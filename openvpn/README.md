# OpenVPN as a Docker Container

2018-12-01, Ognjen Vuković

## Description

**OpenVPN** is a free and open-source software application that implements virtual private network (VPN) techniques to create secure point-to-point or site-to-site connections in routed or bridged configurations and remote access facilities.

The goal of this guide is to create a stateless container running OpenVPN that is:

* based on an image built from scratch (well known image + installation) using a Dockerfile.
* stateless, with all interfaces (state information + communication ports) well defined.

The guide has been verified on:

* Raspberry Pi running Raspbian Lite OS (ARM architecture)
* Ubuntu 18.04 (Intel x64 architecture)

### Container Interfaces

**OpenVPN state information**:

* **Configuration directory** - where OpenVPN looks for configuration files.
    * OpenVPN looks for the configuration files in the directory `/etc/openvpn`
    * The directory contains:
        * Configuration file.
        * Static key can be stored here, when a static key setup is used.

**OpenVPN communication ports**:

* Incoming/Listening ports:
    * Server is listening on a UDP port for connections.
        * The default value is `1194`.
* Outgoing ports:
  * Client is establishing an outgoing connection to a server over UDP.

Needs to be run with cap_add NET_ADMIN

## Prerequisites

* Host running Linux
* Docker installed
* The guide [Install Raspbian with SSH](../raspberry-pi/Install%20Raspbian%20with%20SSH.md) covers the necessary steps for a Raspberry Pi host.

## Step-by-Step Guide

This guide is for setting up a static key configurations. The static key configuration offer the simplest setup, and are ideal for point-to-point VPNs or proof-of-concept testing.

### Prepare environment

1. Clone the repository on both client and server:

    ```shell
    git clone https://github.com/ognjenvukovic/home-it.git
    cd openvpn
    ```
2. Build a Docker image based on the provided [Dockerfile](Dockerfile) on both client and server:

    ```shell
    docker build \
      -t home-it/openvpn .
    ```
3. Prepare/create directories on both client and server
    * If it does not already exist, create a directory on the host for storing configuration files:

    ```shell
    mkdir -p /path/to/dir/for/openvpn/config
    ```
    * replace `/path/to/dir/for/openvpn/config` with the actual location of the OpenVPN configuration directory on the host.
4. Generate a static key:

    ```shell
    docker run \
      --rm \
      --user $(id -u):$(id -g) \
      -v /path/to/dir/for/openvpn/config:/etc/openvpn \
      home-it/openvpn \
      openvpn --genkey --secret /etc/openvpn/static.key
    ```
    * replace `/path/to/dir/for/openvpn/config` with the actual location of the OpenVPN configuration directory on the host.
    * `--rm` signals to the Docker daemon to remove this container once the key generation is completed.
    * `--user $(id -u):$(id -g)` instructs the Docker daemon to run the process in the container as the current user.
        * This is needed so that the ownership of the generated `static.key` file is set properly.
5. Firewall/Port forwarding
6. IP routing on the host

### Start the OpenVPN

* Start the server:

    ```shell
    docker run -d \
        --name openvpn-server \
        --restart=always \
        --volume /path/to/openvpn/config:/etc/openvpn \
        --publish 1194:1194/udp \
        --cap-add NET_ADMIN \
        --volume /dev/net/tun:/dev/net/tun \
        home-it/openvpn \
        openvpn --config /etc/openvpn/static-server.conf
    ```
    * Replace `/path/to/openvpn/config` with the appropriate path on the host.
    * `openvpn-server` in `--name openvpn-server` can be replaced with another desired name for the container.
    * `--publish 1194:1194/udp` exposes the UDP 1194 port.
    * `--cap_add NET_ADMIN` is required so that OpenVPN can set up the network.
    * `--volume /dev/net/tun:/dev/net/tun` is required so that OpenVPN can utilize the tun device.
* Start the client:

    ```shell
    docker run -d \
        --name openvpn-client \
        --restart=always \
        --volume /path/to/openvpn/config:/etc/openvpn \
        --cap-add NET_ADMIN \
        --volume /dev/net/tun:/dev/net/tun \
        home-it/openvpn \
        openvpn --config /etc/openvpn/static-client.conf
    ```
    * Replace `/path/to/openvpn/config` with the appropriate path on the host.
    * `openvpn-client` in `--name openvpn-client` can be replaced with another desired name for the container.
    * `--cap_add NET_ADMIN` is required so that OpenVPN can set up the network.
    * `--volume /dev/net/tun:/dev/net/tun` is required so that OpenVPN can utilize the tun device.

## Sources:
* https://openvpn.net/community-resources/static-key-mini-howto/
* https://github.com/OpenVPN/openvpn/blob/master/sample/sample-config-files/static-home.conf
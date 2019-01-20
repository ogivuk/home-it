# SOCKS Proxy with SSH as a Docker Container

2019-01-18, Ognjen Vuković

## Description

This repository contains instructions on how to set up an SOCKS Proxy with an SSH tunnel, run as a Docker container.

SOCKS Proxy with an SSH tunnel can be used when the goal is to:
* change the source IP address that the destination service will see, or
* bypass an internet filter, or
* protect your communication by utilizing the SSH encryption mechanisms.

SOCKS Proxy with an SSH tunnel is established by:
* having a client establishing an SSH connection to a remote host,
* opening a listening port on the client, where all receiving traffic will be tunneled over SSH to the remote host, and
* configuring applications (such as web browsers) to use the SOCKS proxy.

The client side, with its SSH client, is run as Docker container that:
* is stateless, with all interfaces (state information + communication ports) well defined, and
* can be built using the provided [Dockerfile](Dockerfile),
* can be also run as a Docker Swarm service.

### Container Interfaces

**State information**:

* **SSH Keys** - where OpenSSH looks for the authentication files.
    * OpenSSH looks for the authentication keys in the directory `/root/.ssh`
    * The directory contains:
        * `id_rsa` private key and `id_rsa.pub` public key.
        * `known_hosts` with the list of known hosts.

**Communication ports**:

* Incoming/Listening ports:
    * SOCKS server is listening on a TCP port for connections. The default port is `8000`.
* Outgoing ports:
  * Client is establishing an SSH tunnel to the remote host. The default destination port is `22`.

## Prerequisites

* Remote host with an SSH server running that will be the end of the tunnel
* Local host running Linux that will be a SOCKS proxy server
* Docker installed
* The guide [Install Raspbian with SSH](../raspberry-pi/Install%20Raspbian%20with%20SSH.md) covers the necessary steps for a Raspberry Pi host.

## Step-by-Step Guide

### Prepare the environment

1. Clone the repository where the SOCKS server will run, and go to this directory:

    ```shell
    cd socks-proxy-ssh
    ```
2. Build a Docker image based on the provided [Dockerfile](Dockerfile):

    ```shell
    docker build -t home-it/proxy .
    ```
3. Create a directory for the SSH key:
    * If it does not already exist, create a directory for the SSH key:

    ```shell
    mkdir -p /path/to/dir/with/openssh/key
    ```
    * replace `/path/to/dir/with/openssh/key` with the actual location.
4. Create an SSH key pair:
    * If the SSH key pair has not already been created, run:

        ```shell
        docker run \
            --rm  \
            --volume /path/to/dir/with/openssh/key:/root/.ssh \
            home-it/proxy \
            ssh-keygen \
            -f /root/.ssh/id_rsa
        ```
        * replace `/path/to/dir/with/openssh/key` with the actual location.
        * note that you may need to change the ownership of the generated files using `chmod`.
        * `--rm` signals to the Docker daemon to remove this container once the key generation is completed.
    * Copy the context of the generated `id_rsa.pub` file.
    * Connect to the remote machine.
    * Optionally, create a separate user just for the proxy server.
    * Add the copied context to the `~/.ssh/authorized_keys` file.

### Run the SOCKS server

* On a Docker Host:

    ```shell
    docker run -d \
        --name proxy-server \
        --restart=always \
        --volume /path/to/dir/with/openssh/key:/root/.ssh \
        --publish 8000:8000 \
        --env REMOTE_HOSTNAME=YOUR_REMOTE_HOSTNAME \
        --env REMOTE_USERNAME=YOUR_REMOTE_USERNAME \
        --env REMOTE_SSH_PORT=YOUR_REMOTE_SSH_PORT \
        home-it/proxy
    ```
    * Replace `/path/to/dir/with/openssh/key` with the appropriate path on the host.
    * Replace `YOUR_REMOTE_HOSTNAME` with the remote host name where the SSH client will connect to.
    * Replace `YOUR_REMOTE_USERNAME` with the username used at the remote host for the SSH connection.
    * Replace `YOUR_REMOTE_SSH_PORT` with the SSH port used by the remote host. The default is 22.
    * `proxy-server` in `--name proxy-server` can be replaced with another desired name for the container.
    * `--publish 8000:8000` exposes the 8000 port on the host. The exposed port on the host can be changed by changing the first port (left of :).

* In a Docker Swarm:

    ```shell
    docker service create \
        --name=proxy-server \
        --mount type=bind,src=/path/to/dir/with/openssh/key,dst=/root/.ssh \
        --publish 8000:8000 \
        --env REMOTE_HOSTNAME=YOUR_REMOTE_HOSTNAME \
        --env REMOTE_USERNAME=YOUR_REMOTE_USERNAME \
        --env REMOTE_SSH_PORT=YOUR_REMOTE_SSH_PORT \
        home-it/proxy
    ```
    * Replace `/path/to/dir/with/openssh/key` with the appropriate path on the host.
    * Replace `YOUR_REMOTE_HOSTNAME` with the remote host name where the SSH client will connect to.
    * Replace `YOUR_REMOTE_USERNAME` with the username used at the remote host for the SSH connection.
    * Replace `YOUR_REMOTE_SSH_PORT` with the SSH port used by the remote host. The default is 22.
    * `proxy-server` in `--name=proxy-server` can be replaced with another desired name for the container.
    * `--publish 8000:8000` exposes the 8000 port on the host. The exposed port on the host can be changed by changing the first port (left of :).

### Create a PAC file and share it via an HTTP server

Many client devices cannot be directly configured to use a SOCKS proxy.
However, they can be configured to automatically detect proxy settings from a proxy auto-config (PAC) file.

* Create a PAC file:
    1. Identify the host name where the SOCKS proxy server is running. The guide will refer to it as `SOCKS_HOSTNAME`.
    2. Identify the published port on which the server is listening to. The guide will refer to it as `SOCKS_PORT`.
    3. Create a PAC file from the [provided template](proxy-template.pac):
    
        ```shell
        cp proxy-template.pac proxy.pac
        ```
    4. Replace `SOCKS_HOSTNAME:SOCKS_PORT` with the appropriate host name and port.
    5. Store the file in a separate directory that will be served by a http server.

* Serve the PAC file via an HTTP server:
    1. Set up an HTTP server to serve the PAC file, for example by using the guide [Simple HTTP Server](../simple-http-server).
    2. Note down the hostname running the web server. The guide will refer to it as `HTTP_SERVER_HOSTNAME`.
    3. Note down the published port on which the web server is listening to. The guide will refer to it as `HTTP_SERVER_PORT`.

* The URL for the auto proxy settings in client devices is `http://HTTP_SERVER_HOSTNAME:HTTP_SERVER_PORT/proxy.pac`.

### Configure the client devices

* Firefox web browser:
    1. In Firefox, open "Settings".
    2. Under "General", scroll to the bottom to "Network Settings", and click on "Settings".
    3. Under "Configure Proxy Access to the Internet", select "Manual proxy configuration".
    4. Under "SOCKS Host" enter `YOUR_LOCAL_SOCKS_HOST` and under "Port" enter your `YOUR_LOCAL_SOCKS_PORT`.
    5. Finally, select "SOCKS v5" and press "OK".

* iOS device:
    1. In the iOS, go to Settings -> Wi-Fi
    2. Click the blue round i sign on the right of your wireless network
    3. Under "HTTP PROXY" section, choose "Auto" and fill the URL of the PAC file set up earlier.

* Fire TV:
    1. Open the hidden Developer Tools Menu by holding the SELECT and DOWN button on the Fire TV remote for 5 seconds and then pressing the MENU button.
    2. Open "Network Proxy".
    3. Chose the "Auto" option and fill the URL of the PAC file set up earlier.

## Sources:
* https://superuser.com/questions/1308495/how-to-create-a-socks-proxy-with-ssh
* https://serverfault.com/questions/361794/with-ssh-only-reverse-tunnel-web-access-via-ssh-socks-proxy
* https://stackoverflow.com/questions/7260/how-do-i-setup-public-key-authentication
* https://www.systutorials.com/4876/how-to-configure-ios-for-iphone-and-ipad-to-use-socks-proxy-created-by-ssh/
* http://www.aftvnews.com/fire-tv-update-adds-new-hidden-network-proxy-settings/
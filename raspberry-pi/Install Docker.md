# Install Docker on Raspberry Pi

2018-10-10, Ognjen Vuković

## Description

This is a guide on how to install Docker on Raspberry Pi.

### Requirements

* Raspberry Pi with a Linux based OS, e.g., Raspbian Lite
* SSH server running on Raspberry Pi, or a screen and a keyboard connected to the Raspberry Pi
* User with sudo rights
* Internet access

The guide [Install Raspbian with SSH](Install%20Raspbian%20with%20SSH.md) covers all prerequisites.

## Step-by-Step Guide

1. Login to the Raspberry Pi via SSH or directly using a screen and a keyboard.
2. Get and execute the official Docker installation script:

    ```shell
    curl -sSL https://get.docker.com | sh
    ```
    * If SSL certificate issues occur, see the [troubleshooting section](#troubleshooting) below.
3. Add the user to docker group so that docker does not require sudo:

    ```shell
    sudo usermod -aG docker $USER
    ```
4. Enable docker to start with the system:

    ```shell
    sudo systemctl enable docker
    ```
5. Use `overlay2` storage driver for OverlayFS.
    * `overlay2` is recommended over `overlay`, because it is more efficient in terms of inode utilization.
    * `overlay2` requires Linux kernel version 4.0 or higher.
    1. Check which driver is in use:

        ```shell
        docker info | grep "Storage Driver"
        ```
    2. Check for the Linux kernel version:

        ```shell
        uname -r
        ```
    3. If the storage driver is `overlay` and the kernel version is 4.0 or higher, proceed with the steps.
    4. Stop Docker:

        ```shell
        sudo systemctl stop docker
        ```
    5. Edit `/etc/docker/daemon.json`. If it does not exists, create the file. The file should contain:
        ```json
        {
            "storage-driver": "overlay2"
        }
        ```
    6. Start Docker:

        ```shell
        sudo systemctl start docker
        ```
    7. Verify that the Docker daemon is using the `overlay2` storage driver:

        ```shell
        docker info | grep "Storage Driver"
        ```
6. [Optional] Install docker-compose:

    ```shell
    sudo apt-get install -y docker-compose
    ```

## Troubleshooting

* If facing issues with SSL certificates, make sure that the date and time setting on the host is correct.
  * For setting the date and time via terminal, see: https://www.garron.me/en/linux/set-time-date-timezone-ntp-linux-shell-gnome-command-line.html

## Sources

* https://blog.alexellis.io/getting-started-with-docker-on-raspberry-pi/
* https://docs.docker.com/storage/storagedriver/overlayfs-driver/
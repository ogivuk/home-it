# Set Up Raspberry Pi with Raspbian Lite OS and SSH

2018-10-10, Ognjen Vuković

## Description

This is a guide on how to set up a Raspberry Pi with the Raspbian Lite OS and an SSH server from scratch.

### Requirements

* Raspberry Pi
* SD card
* USB cable with a power adapter to power the Raspberry Pi
* Screen with an HDMI cable (or adapter)
* Keyboard with the USB connection
* Internet access

## Step-by-Step Guide

1. Download the latest [Raspbian Lite](https://www.raspberrypi.org/downloads/raspbian/) to keep the install as lean as possible, assuming there is no need for GUI.
2. Download and install [Etcher](https://etcher.io/).
3. Flash an SD card with the downloaded image using Etcher.
4. Put the SD card in the Raspberry Pi, attach a screen and a keyboard, and power it.
5. Login using the default Raspbian username and password.
    * Username: `pi`
    * Password: `raspberry`
6. Change the password for the pi user:

    ```shell
    passwd
    ```
    * Enter (and repeat) a new password.
7. Change the hostname:

    ```shell
    sudo nano /etc/hostname
    ```
    * Change the hostname.
    * Save the file using Ctrl+x, then Y followed by Enter.

    ```shell
    sudo nano /etc/hosts
    ```
    * Find the line starting with `127.0.0.1` and with old hostname, and change the hostname.
    * Save the file using Ctrl+x, then Y followed by Enter.
8. Activate SSH:

    ```shell
    sudo touch /boot/ssh
    ```
9. If not done already, connect the Raspberry Pi to the network.
10. Make sure the OS is up to date:

    ```shell
    sudo apt-get update && sudo apt-get -y upgrade
    ```
11. Reboot:
    ```shell
    sudo reboot
    ```

## Troubleshooting

* If the client gets "Connection reset by ... port 22":
    1. Run ```$ sudo service ssh status ``` on the Raspberry Pi.
    2. If there are errors such as ```error: Could not load host key: /etc/ssh/ssh_host*``` then,
    3. Run ```$ sudo rm /etc/ssh/ssh_host_* && sudo dpkg-reconfigure openssh-server```.

## Sources

* https://thepihut.com/blogs/raspberry-pi-tutorials/19668676-renaming-your-raspberry-pi-the-hostname
* https://blog.alexellis.io/getting-started-with-docker-on-raspberry-pi/
* https://www.raspberrypi.org/forums/viewtopic.php?t=15814


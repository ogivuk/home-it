# Mount USB Storage

2018-10-11, Ognjen Vuković

## Description

This is a guide on how to set up a Raspberry Pi to automatically mounts and unmounts USB removable devices.

### Requirements

* Raspberry Pi with a Linux based OS, e.g., Raspbian Lite
* SSH server running on Raspberry Pi, or a screen and a keyboard connected to the Raspberry Pi
* User with sudo rights
* Internet access
The guide [Install Raspbian with SSH](Install%20Raspbian%20with%20SSH.md) covers all prerequisites.

## Step-by-Step Guide

### Automatically Mount with Every Boot

1. Login to the Raspberry Pi via SSH or directly using a screen and a keyboard.
2. Create a mount point:
    
    ```shell
    sudo mkdir /media/mount_name
    ```
    * Replace `mount_name` with a desired name.
3. Get the UUID and FSTYPE of the disk to be mounted:

    ```shell
    lsblk -f
    ```
    * Using UUID rather than the device node (e.g., /dev/sda1) is recommended as the device node can change across reboots especially if drives are added or removed.
    * Note down the `UUID` and `FSTYPE` values of the disk, they are later referred to as `uid` and `fstype`, respectively.
4. Back-up the existing fstab file:

    ```shell
    sudo cp /etc/fstab /etc/fstab.bak
    ```
5. Edit the fstab file:

    ```shell
    sudo nano /etc/fstab
    ```
    * Add a line similar to this, tweaking mount options and mount point as required:
    UUID=uuid /media/mount_name fstype defaults,nofail 0 0
    * Replace `uid`, `mount_name`, and `fstype` with the appropriate values obtained in the previous steps.
    * Include "nofail" in the mount options to prevent the Pi hanging if it is booted without the drive attached.
    * Alternatively, `LABEL` can be used instead of `UID`.
6. Save and close `/etc/fstab`.
7. Connect the HDD and reboot:

    ```shell
    sudo reboot
    ```

### Manually Mounting and Unmounting

To mount the disk:
1. Create a mount point:
    
    ```shell
    sudo mkdir /media/mount_name
    ```
    * Replace `mount_name` with a desired name.
2. Identify the NAME of the disk:

    ```shell
    lsblk -f
    ```
3. Mount the disk:

    ```
    sudo mount /dev/name /media/mount_name
    ```
    * Replace `name` and `mount_name` with the appropriate values.

To unmount the disk:
1. Run:

    ```shell
    sudo umount /media/mount_name
    ```
    * Replace `mount_name` with the appropriate value.

## Sources

* https://www.raspberrypi.org/forums/viewtopic.php?t=205016#p1271406
* https://gist.github.com/etes/aa76a6e9c80579872e5f


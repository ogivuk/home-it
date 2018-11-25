# Security Hardening of Rasperry Pi running Raspbian

Protect against brute force SSH attacks, where an attacker tries to establish a remote connection via SSH using:
* Default usernames: `pi`, and `root`
* Default SSH port: `22`.

## SSH
1. Change the default port for SSH server:
    * Open the configuration file for editing:

        ```shell
        sudo nano /etc/ssh/sshd_config
        ```
    * Uncomment `#Port 22` and change `22` to the desired port.
    * Restart SSH server:
    
        ```shell
        sudo service ssh restart
        ```
2. Disable `root` login
    * There is no root password set by default on Debian, everything is expected to be done through sudo. However, it is recommended to disable the root login just in case the root password gets set later, for some reason.
    * Open the configuration file for editing:
    
        ```shell
        sudo nano /etc/ssh/sshd_config
        ```
    * Uncomment the line that starts with `#PermitRootLogin`, and edit it to:

        ```
        PermitRootLogin no
        ```
    * Restart SSH server:
    
        ```shell
        sudo service ssh restart
        ```

## Replace the default `pi` user
1. First create a new user:
        
    ```shell
    sudo adduser new_name
    ```
    * replace `new_user` with the desired username.
2. While still logged in as `pi`, assign all `pi` group memberships to the new user:
    
    ```shell
    sudo usermod new_name -a -G "$(groups | sed 's/ /,/g')"
    ```
    * replace `new_user` with the desired username.
3. While still logged in as `pi`, add sudo privileges for the new user without having to use the password each time: 

    ```shell
    echo "new_user ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/010_new_user-nopasswd
    sudo chmod 0440 /etc/sudoers.d/010_new_user-nopasswd
    ```
    * replace `new_user` with the desired username.
4. Update autologin
    * Autologin for the console:

        ```shell
        sudo nano /etc/systemd/system/autologin@.service
        ```
        * Near the top of the file, there is `ExecStart=-/sbin/agetty --autologin pi --noclear %I $TERM`.
        * Replace `pi` with the corresponding user name.
    * Autologin for the desktop, if the desktop environment is used:

        ```shell
        sudo nano /etc/lightdm/lightdm.conf
        ```
        * The file exists only if the desktop environment is used.
        * Near the bottom of the file, there is `autologin-user=pi`.
        * Replace `pi` with the corresponding user name.
5. [Optional] Swap UIDs and GIDs between `pi` and the new user:
    * Get the current UID and GID for the `pi` user and remember the values (they are typically both 1000 per default):

        ```shell
        id pi
        ```
    * Get the current UID and GID for the new user and remember the values:

        ```shell
        id new_user
        ```
        * replace `new_user` with the corresponding username.
    * Log in as the new user, and assign to `pi` a temporary UID and GID not already in use (e.g., 2000):

        ```shell
        sudo usermod -u 2000 pi
        sudo groupmod -g 2000 pi
        ```
    * Log in as the `pi` user, and assign to the new user the old `pi` UID and GID. Assuming 1000 for both:

        ```shell
        sudo usermod -u 1000 new_user
        sudo groupmod -g 1000 new_user
        ```
        * replace `new_user` with the corresponding username.
    * Change the UID and GID for all files created by the new user, assuming 1000 as new UID and GID:

        ```shell
        sudo find / -user old_uid -exec chown -h 1000 {} \;
        sudo find / -group old_gid -exec chgrp -h 1000 {} \;
        ```
        * replace `old_uid` and `old_gid` with the old UID and GID values for the new user.
    * Note that all files and folders previously created by `pi` will be assigned to the new user.
    * The user and the group `pi` can not be removed.
6. Remove the `pi` user and the `pi` group.
    * Log in as the new user, and remove the `pi` user:

        ```shell
        sudo deluser -remove-home pi
        ```
        * `-remove-home` also removes the `/home/pi` directory as well.
        * replace `new_user` with the corresponding username.
    * Remove the `pi` group:
    
        ```shell
        sudo groupdel pi
        ```

## Resources

* https://mediatemple.net/community/products/dv/204643810/how-do-i-disable-ssh-login-for-the-root-user
* https://raspi.tv/2012/how-to-create-a-new-user-on-raspberry-pi
* https://www.raspberrypi.org/forums/viewtopic.php?t=169079
* https://muffinresearch.co.uk/linux-changing-uids-and-gids-for-user/
* https://www.cyberciti.biz/faq/howto-change-rename-user-name-id/
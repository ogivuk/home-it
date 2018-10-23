# home-it

## TODO


NEXT IN A DIFFERENT FILE:
* SAMBA: https://stackoverflow.com/questions/49357524/docker-alpine-samba-does-not-start/50322296
* [NO] UDEVIL for mounting the HDD: https://ignorantguru.github.io/udevil/
    * https://docs.google.com/document/d/1B5IHLbEmQHAZqVZf8eYtpZZrn6QDjg0LJVMmMnVX--E/edit#

Learn about Linux passwords: https://raspberrypi.stackexchange.com/questions/47126/raspbian-root-default-password



### Security Hardening of Raspberry Pi
1. Change the default port for SSH server:

    ```shell
    sudo nano /etc/ssh/sshd_config
    ```
    * Uncomment `#Port 22` and change `22` to the desired port.
    * Restart SSH server:
    
    ```shell
    sudo service ssh restart
    ```

2. Remove the `pi` user:
    1. First create a new user:
        
        ```shell
        sudo adduser newuser_name
        ```
    2. While still logged in as `pi`, assign all `pi` group memberships to the new user:
    
        ```shell
        sudo usermod newuser_name -a -G "$(groups | sed 's/ /,/g)"
        ```
    3. Add sudo privileges without having to use a password each time: 

        ```shell
        echo "newuser_name ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/010_newuser_name-nopasswd
        chmod 0440 /etc/sudoers.d/010_newuser_name-nopasswd
        ```
    4. TODO: write the other things too, if GUI is used:
        * https://www.raspberrypi.org/forums/viewtopic.php?t=169079
    5. Remove the pi user:
        * TODO:
            * https://www.raspberrypi.org/forums/viewtopic.php?t=169079
            * https://www.cyberciti.biz/faq/howto-change-rename-user-name-id/
            * https://raspi.tv/2012/how-to-create-a-new-user-on-raspberry-pi
        * Consider moving these 2 optional to something like "Security hardening", include disabling root ssh login
            * There is no root password set by default on Debian. You are expected to do everything through sudo. You can set one with "sudo passwd root" - just make sure you know what you are doing with a root account.
            * Advice, do not set up the root password, but in case someone else does, disable the root ssh login
            * So we disable the root login just in case the root password gets set later, for some reason.
    6. Change the UID and GID?
        * https://muffinresearch.co.uk/linux-changing-uids-and-gids-for-user/

Sources:
* http://tldp.org/LDP/abs/html/x23170.html
* https://www.raspberrypi.org/forums/viewtopic.php?t=169079
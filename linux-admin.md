# Linux Administration

This file contains some brief but useful Linux administration guides and tips.

## Schedule Periodic Jobs

`cron` is a time-based job scheduler in Unix-like computer operating systems that can be used to schedule jobs (commands or shell scripts) to run periodically at fixed times, dates, or intervals.

### Schedule a Job using Cron

Cron is driven by a `crontab` (cron table) file, a configuration file that specifies shell commands to run periodically on a given schedule:
* System-wide crontab: usually in or under `/etc`.
* Users can have their own individual crontab files.
  * User crontab file can be edited by calling ```$crontab -e```.

Each line of a crontab file represents a job, and looks like this:

```shell
* * * * * user command
│ │ │ │ │
│ │ │ │ +-─ day of the week (0 - 6) (Sunday to Saturday)
│ │ │ +──── month (1 - 12)
│ │ +─-──── day of the month (1 - 31)
│ +──────── hour (0 - 23)
+────────── minute (0 - 59)
```

## Data Back-Up and Synchronization

`rsync` is a utility for efficiently transferring and synchronizing by comparing the modification times and sizes of files.

Rsync is typically used for synchronizing files and directories between two different systems, but it can be used to synchronize files between folders within a single host. When synchronizing files between two hosts, rsync uses SSH to connect as user to remote-host, and then it will invoke the remote host's rsync for the two programs (local and remote) to determine what parts of the local file need to be transferred so that the remote file matches the local one.

### Using Rsync

Local: ```rsync [OPTIONS] SRC DEST```

Remote:

* Pull: ```rsync [OPTIONS] [USER@]HOST:SRC DEST```
* Push: ```rsync [OPTIONS] SRC [USER@]HOST:DEST```

Useful options:
* `-a` indicates to use recursion and to preserve almost everything (e.g., file ownership)
* `-v` increases verbosity. Without this option, rsync works silently.
* `--delete` tells rsync to delete files from the receiving side that are not on the sending side.
* `--exclude=PATTERN` exclude files matching PATTERN
* `--dry-run` makes rsync perform a trial run that doesn’t make any changes. Use with `-v`


# Links

* [Cron Wikipedia](https://en.wikipedia.org/wiki/Cron)
* [Rsync Wikipedia](https://en.wikipedia.org/wiki/Rsync)
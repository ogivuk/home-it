# Duck DNS client

[**Duck DNS**](https://www.duckdns.org/) is a free dynamic DNS hosted on AWS.

If you are into Dockerizing everything or you just want to have a better view
over this update process (e.g., to see it in your cluster visualizer),
this repository provides you with a Docker image to run the Duck DNS update
for your the domain.

The provided image is open-source and built from scratch with the goal to enable you to run a stateless and an immutable container, according to the best practices.

Supported architectures:

* the image supports multiple architectures: `x86-64` and `arm32`
* the docker manifest is used for multi-platform awareness
* by simply pulling or running `ogivuk/duckdns-client:latest`, the correct image for your architecture will be retreived

| Tag | Transmission Version and Architecture |
| :--- | :----    |
| `:latest` | supports both `x64` and `arm32v7` architectures |
| `:x64` | targeted to the `x64` architecture |
| `:arm32v7` | targeted to the `arm32v7` architecture |

## Usage

1. _First time only_: Prepare the setup
    1. create a folder to hold the duckdns update script and later the generated logs, for example `~/duckdns`
      * this folder will be later mounted in the container
      * for Docker Swarm, this directory **needs to be available on all nodes in Docker swarm**, e.g., via network shared storage

      ```bash
      mkdir ~/duckdns
      ```

    2. create the duckdns update script `duck.sh` for your domain, as described in [Duck DNS install](https://www.duckdns.org/install.jsp)
      * **only the part** the 2 steps with `vi duck.sh` and `echo url=...`, **do not** set up the cron!
2. Start the client
    * as a container:

        ```bash
        docker run -d \
            --name=duckdns-client \
            --restart unless-stopped \
            --volume ~/duckdns/:/root/duckdns \
            ogivuk/duckdns-client
        ```

    * as a swarm service:

        ```bash
        docker service create \
            --name=duckdns-client \
            --mount type=bind,src=~/duckdns/,dst=/root/duckdns/ \
            ogivuk/duckdns-client
        ```

3. To verify that the updates are working well, inspect the log file `duck.log` in the mounted directory, for the above example it is `~/duckdns`

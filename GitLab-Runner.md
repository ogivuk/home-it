# Set Up GitLab CI/CD Runner on Raspberry Pi as a Docker Container (on Docker Swarm)

2018-11-26, Ognjen Vuković

## Description

This is a guide on how to install and set up:

* GitLab Runner as a Docker service (in a container); run on a single host or in a swarm mode.
  * Each job is run in a separate and isolated container using the predefined image that is set up in `.gitlab-ci.yml`.
  * This makes it easier to have a simple and reproducible build environment that can also run on your workstation.
* GitLab Runner as a Docker service that can also use Docker Engine to build, test, and deploy docker-based projects; run on a single host or in a swarm mode.
  * This configuration allows the GitLab runner to build, test, and deploy Docker images.
  * This runner requires the Docker socket binding, which is a high system privilege, so we define it as a separate runner to be used only when Docker images are being created.

### Requirements

* Raspberry Pi with a Linux based OS, e.g., Raspbian Lite.
* Docker installed.
* [Optional] Docker Swarm set up.
* Internet access.

The guides [Install Raspbian with SSH](raspberry-pi/Install%20Raspbian%20with%20SSH.md) and [Install Docker](raspberry-pi/Install%20Docker.md) cover all prerequisites.
The guide [Swarm Setup](raspberry-pi/Swarm%20Setup.md) explains how to set up a Docker Swarm.

## Step-by-Step Guide

### Registering the Runner with GitLab

1. Get the runner token from the project GitLab page: `Settings -> CI/CD -> Specific Runners -> Setup a specific Runner manually`.
2. Make a configuration directory for the GitLab runner

    ```shell
    sudo mkdir -p /path/to/gitlab-runner/config
    sudo chown -R $(id -u):$(id -g) /path/to/gitlab-runner/config
    ```
    * Replace `/path/to/gitlab-runner/config` with an appropriate path on the host.
3. Register the GitLab runner as a Docker service

    ```shell
    docker run --rm -it \
    --name gitlab-runner-register \
    --volume /path/to/gitlab-runner/config:/etc/gitlab-runner \
    klud/gitlab-runner register --non-interactive \
    --url "GITLAB_SERVER_URL" \
    --registration-token "TOKEN" \
    --description "DESCRIPTION" \
    --executor "docker" \
    --docker-image "resin/rpi-raspbian" \
    --tag-list "TAGS" \
    --locked="true" \
    --run-untagged="false" \
    --docker-pull-policy="if-not-present" \
    --limit="MAX_CONCURRENT_JOBS"
    ```
    * `gitlab-runner-register` in `--name gitlab-runner-register` can be replaced with another desired name for the container. However, this is just a temporary name as the container is immediately removed afterwards.
    * Replace `/path/to/gitlab-runner/config` with the appropriate path on the host.
    * Replace `GITLAB_SERVER_URL` with the appropriate GitLab server URL.
    * Replace `TOKEN` with the appropriate value obtained in Step 1.
    * Replace `DESCRIPTION` with an appropriate description of the runner that will be seen in GitLab.
    * Replace `TAGS` with the appropriate comma-separated tags that will be used in `.gitlab-ci.yml` to target this runner.
    * Replace `MAX_CONCURRENT_JOBS` with the appropriate maximum number of concurrent jobs to be run by this runner.
    * [`klud/gitlab-runner`](https://hub.docker.com/r/klud/gitlab-runner/) is an image built for ARM devices, based on the official repository of the GitLab Runner.
    * Passed registration arguments:
      * `--non-interactive` runs the registration without user interaction.
      * `--executor "docker"` specifies that the runner will run as a Docker service.
      * `--docker-image "resin/rpi-raspbian"` instructs the runner to use `resin/rpi-raspbian` as the default image when executing the CI/CD jobs. It can be replaced with another desired image.
      * `--locked="true"` locks the runner to the current GitLab project only. Replace with `--locked="false"` if you wish to open the runner to other projects as well.
      * `--run-untagged="false"` instructs the runner not to run any untagged builds specified in `.gitlab-ci.yml`.
      * `--docker-pull-policy="if-not-present"` instructs the runner to first check if the image is present locally, and will use the local image. If the image is not present locally, the runner will try to pull the image. This is recommended when getting and/or creating the image for CI jobs is time consuming.
      * `--limit` Specifies the maximum number of concurrent jobs run by this runner. The default value is "0", which means unlimited.
    * The registration will create a configuration file in `/srv/gitlab-runner/config/config.toml` through the volume binding.
    * Notes:
      * if run multiple times, multiple registrations will happen.
      * do not use `--restart=always` here because it will cause an infinite loop with continuous registrations of new runners: when registration finishes the container exits, `--restart=always` makes docker to start the container again which will do a new registration, etc.
4. Register the GitLab runner as a Docker service that can build, test, and deploy Docker images

    ```shell
    docker run --rm -it \
    --name gitlab-runner-register \
    --volume /path/to/gitlab-runner/config:/etc/gitlab-runner \
    klud/gitlab-runner register \
    --non-interactive \
    --url "GITLAB_SERVER_URL" \
    --registration-token "TOKEN" \
    --description "DESCRIPTION" \
    --executor "docker" \
    --docker-image "docker:stable" \
    --tag-list "TAGS" \
    --locked="true" \
    --run-untagged="false" \
    --docker-pull-policy="if-not-present" \
    --limit="MAX_CONCURRENT_JOBS" \
    --docker-volumes "/var/run/docker.sock:/var/run/docker.sock"
    ```
    * `gitlab-runner-register` in `--name gitlab-runner-register` can be replaced with another desired name for the container. However, this is just a temporary name as the container is immediately removed afterwards.
    * Replace `/path/to/gitlab-runner/config` with the appropriate path on the host.
    * Replace `GITLAB_SERVER_URL` with the appropriate GitLab server URL.
    * Replace `TOKEN` with the appropriate value obtained in Step 1.
    * Replace `DESCRIPTION` with an appropriate description of the runner that will be seen in GitLab.
    * Replace `TAGS` with the appropriate comma-separated tags that will be used in `.gitlab-ci.yml` to target this runner.
    * Replace `MAX_CONCURRENT_JOBS` with the appropriate maximum number of concurrent jobs to be run by this runner.
    * [`klud/gitlab-runner`](https://hub.docker.com/r/klud/gitlab-runner/) is an image built for ARM devices, based on the official repository of the GitLab Runner.
    * Passed registration arguments:
      * `--non-interactive` runs the registration without user interaction.
      * `--executor "docker"` specifies that the runner will run as a Docker service.
      * `--docker-image "docker:stable"` instructs the runner to use `docker:stable` as the default image when executing the CI/CD jobs. `docker:stable` is required because it supports docker commands to be executed.
      * `--tag-list` specifies tags that can be used in `.gitlab-ci.yml` to target this runner.
      * `--locked="true"` locks the runner to the current GitLab project only. Replace with `--locked="false"` if you wish to open the runner to other projects as well.
      * `--run-untagged="false"` instructs the runner not to run any untagged builds specified in `.gitlab-ci.yml`.
      * `--docker-pull-policy="if-not-present"` instructs the runner to first check if the image is present locally, and will use the local image. If the image is not present locally, the runner will try to pull the image. This is recommended when getting and/or creating the image for CI jobs is time consuming.
      * `--limit` Specifies the maximum number of concurrent jobs run by this runner. The default value is "0", which means unlimited.
      * `--docker-volumes="/var/run/docker.sock:/var/run/docker.sock"` binds the Docker socket to every container that the runner will start while running CI/CD jobs specified in `.gitlab-ci.yml`.
    * The registration will create a configuration file in `/srv/gitlab-runner/config/config.toml` through the volume binding.
    * Notes:
      * if run multiple times, multiple registrations will happen.
      * do not use `--restart=always` here because it will cause an infinite loop with continuous registrations of new runners: when registration finishes the container exits, `--restart=always` makes docker to start the container again which will do a new registration, etc.

### Starting the Runner

* It is possible to use multiple configurations, defined in `/path/to/gitlab-runner/config/config.toml`, in a single GitLab Runner.
* When GitLab Runner is started, `run` command is executed and it reads all defined Runners from `config.toml` and tries to run all of them.

#### On a Docker Host

```shell
docker run -d \
    --name gitlab-runner \
    --restart=always \
    --volume /path/to/gitlab-runner/config:/etc/gitlab-runner \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    klud/gitlab-runner
```
* `gitlab-runner` in `--name gitlab-runner` can be replaced with another desired name for the container.
* Replace `/path/to/gitlab-runner/config` with the appropriate path on the host.
* `--volume /var/run/docker.sock:/var/run/docker.sock` is required so that the runner can interact with Docker.
* [`klud/gitlab-runner`](https://hub.docker.com/r/klud/gitlab-runner/) is an image built for ARM devices, based on the official repository of the GitLab Runner.
* Notes:
    * `docker exec` only works with currently running containers, and therefore, we used `docker run` here.

#### In a Docker Swarm

```shell
docker service create \
    --name gitlab-runner \
    --mount type=bind,src=/path/to/gitlab-runner/config,dst=/etc/gitlab-runner \
    --mount type=bind,src=/var/run/docker.sock,dst=/var/run/docker.sock \
    klud/gitlab-runner
```
* `gitlab-runner` in `--name gitlab-runner` can be replaced with another desired name for the container.
* Replace `/path/to/gitlab-runner/config` with the appropriate path on the host.
* `--volume /var/run/docker.sock:/var/run/docker.sock` is required so that the runner can interact with Docker.
* [`klud/gitlab-runner`](https://hub.docker.com/r/klud/gitlab-runner/) is an image built for ARM devices, based on the official repository of the GitLab Runner.
* Notes:
    * `docker exec` only works with currently running containers, and therefore, we used `docker run` here.

## Sources

* https://docs.gitlab.com/ee/ci/docker/using_docker_images.html
* https://docs.gitlab.com/ee/ci/docker/using_docker_build.html
* https://docs.gitlab.com/runner/install/docker.html
* https://docs.gitlab.com/runner/configuration/advanced-configuration.html
* https://docs.gitlab.com/runner/commands/
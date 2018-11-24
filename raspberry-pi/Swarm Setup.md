# Set up Swarm on Raspberry Pi(s)

2018-11-24, Ognjen Vuković

## Description

This is a guide on how to set up Swarm on Raspberry Pis.

### Requirements

* Raspberry Pi with a Linux based OS, e.g., Raspbian Lite.
* Docker installed, version 1.12 or later.
* User with sudo rights.
* Internet access.

The guides [Install Raspbian with SSH](Install%20Raspbian%20with%20SSH.md) and [Install Docker](Install%20Docker.md) cover all prerequisites.

## Step-by-Step Guide

* There is no need to install Swarm, it comes built-in with Docker Engine 1.12 or newer.

### Create and Join Swarm

1. Create a Docker swarm:

    ```shell
    docker swarm init --advertise-addr IP_ADDRESS
    ```
    * Replace `IP_ADDRESS` with the IP address on which the node can be reached by other Swarm nodes.
    * Note that this node will become a master node by default.
    * Upon completion, the command will generate a token to be used for workers to join the swarm. Note down the token.
2. Get the tokens used by other nodes to join the swarm:
    * Get the manager token:

        ```shell
        docker swarm join-token manager
        ```
        * Note down the token or the entire command.
    * Get the worker token:
        
        ```shell
        docker swarm join-token worker
        ```
        * Note down the token or the entire command.
3. Join a swarm:

    ```shell
    docker swarm join --token TOKEN IP_ADDRESS:2377
    ```
    * Replace `TOKEN` with an appropriate token obtained in Step 2, depending on whether the node joins as a manager or as a worker.
    * Replace `IP_ADDRESS` with the IP address advertised by the manager in Step 1.
    * Used TCP port `2377` is the default port for cluster management communications.
4. Leave the swarm:

    ```shell
    docker swarm leave
    ```

### Visualizer


## Sources

* https://docs.docker.com/engine/swarm/swarm-tutorial/create-swarm/
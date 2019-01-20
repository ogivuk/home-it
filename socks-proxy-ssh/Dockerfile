# Use Docker's official Alpine Linux image as a parent image
FROM alpine

# Install OpenSSH from the official repository
RUN apk update && \
    apk add --no-cache openssh

# Set default values for environment variables.
## The values for remote hostname and username are expected to be
## when starting the container
ENV REMOTE_HOSTNAME="localhost"
ENV REMOTE_USERNAME="root"
ENV REMOTE_SSH_PORT="22"

# Expose the SOCKS server listening port outside of this container.
# The default port is 8000.
EXPOSE 8000

# Expose the volume where SSH keys are expected
VOLUME /root/.ssh

# The default command establishes an SSH connection to the remote host
# defined by the environment variables.
## The provided arguments are:
## -N tells SSH not to execute remote command once the tunnel is up
## -g allows remote hosts to connect to local forwarded ports.
## -oStrictHostKeyChecking=no disables strict key host checking 
## -oServerAliveInterval=120 tells SSH that every 120s it should send a keepalive message to the server.
## -D tells SSH that we want it to act as a SOCKS proxy server.
## -p specifies on which port is the SSH server listening to (default is 22).
CMD ["sh", "-c", "ssh \
    -N \
    -g \
    -oStrictHostKeyChecking=no \
    -oServerAliveInterval=120 \
    -D 8000 \
    -p $REMOTE_SSH_PORT \
    $REMOTE_USERNAME@$REMOTE_HOSTNAME"]

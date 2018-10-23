# Use Docker's official Alpine Linux image arm32v6/alpine as a parent image
FROM arm32v6/alpine

# Ensure the data volume directory on the host is owned by the same user; assume 1000
ENV TUID=1000 TGID=1000

# Expose the default transmission ports outside of this container
EXPOSE 9091/tcp 51413/tcp 51413/udp

# Expose the volumes used by the transmission outside of this container
VOLUME /transmission/config /transmission/downloads /transmission/watch

# Update the package list and install transmission without using the cache.
RUN apk update && \
    apk add --no-cache transmission-daemon

# Create a user with the given UID and GID
RUN adduser -D -u $TUID -g $TGID tuser

# Create the shared folders and give the ownership to the given user
## /transmission/config also includes 'torrents' folder with .torrent files
RUN mkdir -p /transmission/config && \
    mkdir -p /transmission/downloads && \
    mkdir -p /transmission/watch && \
    chown -R $TUID:$TGID /transmission

# Set the user to the newly created user
USER tuser:tuser

# Run the transmission-daemon as the user
CMD ["/usr/bin/transmission-daemon", "--foreground", "--config-dir", "/transmission/config"]
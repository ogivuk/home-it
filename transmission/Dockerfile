# Use Docker's official Alpine Linux image as a parent image
FROM alpine

# Update the package list and install transmission without using the cache.
RUN apk update && \
    apk add --no-cache transmission-daemon

# Expose the default transmission ports outside of this container
EXPOSE 9091/tcp 51413/tcp 51413/udp

# Expose the volumes used by the transmission outside of this container
VOLUME /transmission/config /transmission/downloads /transmission/watch

# Ensure the data volume directory on the host is owned by the proper user.
# Expect the UID and GID to be provided as build arguments, otherwise assume 1000
ARG TUID
ENV TUID ${TUID:-1000}
ARG TGID
ENV TGID ${TGID:-1000}

# Create a user with the given UID and GID
RUN adduser -D -u $TUID -g $TGID tuser

# Create the shared folders and give the ownership to the given user
RUN mkdir -p /transmission/config && \
    mkdir -p /transmission/downloads && \
    mkdir -p /transmission/watch && \
    chown -R $TUID:$TGID /transmission

# Set the user to the newly created user
USER tuser:tuser

ENV TRANSMISSION_HOME="/transmission/config"

# Run the transmission-daemon as the user
CMD ["/usr/bin/transmission-daemon", "--foreground"]
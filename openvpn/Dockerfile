# Use Docker's official Alpine Linux image as a parent image
FROM alpine

# Install OpenVPN from the official repository
RUN apk update && \
    apk add --no-cache openvpn

# Expose the default OpenVPN port outside of this container
EXPOSE 1194/udp 

# Expose the volume used by the OpenVPN outside of this container
VOLUME /etc/openvpn

CMD ["openvpn", "--config /etc/openvpn/server.conf"]
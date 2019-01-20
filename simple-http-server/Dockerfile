# Use Docker's official Alpine Linux image as a parent image
FROM alpine

# Install Python3 from the official repository.
# http.server is included in the default Python3 installation.
RUN apk update && \
    apk add --no-cache python3

# Set default values for environment variables.
ENV LISTENING_PORT="8000"

# Expose the volume where the shared files are expected
VOLUME /app/share

# Set the working directory to be the directory with the files to share
WORKDIR /app/share

# Expose the port 8000 on which the http web server listens
EXPOSE 8000

# The default command starts the python module http.server
# and instructs the module to listen on the provided port
CMD ["sh", "-c", "python3 -m http.server 8000"]

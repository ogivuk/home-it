FROM alpine

RUN apk add --update-cache \
    curl \
 && rm -rf /var/cache/apk/*

RUN mkdir /root/duckdns

RUN echo "*/5 * * * * sh /root/duckdns/duck.sh" >> /etc/crontabs/root

CMD crond

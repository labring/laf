FROM alpine:3.16.2

ARG TARGETARCH

WORKDIR /root

COPY bin /bin

RUN cp /bin/manager-$TARGETARCH /manager && rm -rf /bin

ENTRYPOINT ["/manager"]

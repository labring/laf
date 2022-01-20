FROM openresty/openresty:latest
RUN apt-get update && apt-get install -y wget

# ENV DOCKERIZE_VERSION v0.6.1
# RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
#   && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
#   && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

WORKDIR /app
EXPOSE 80

ENV SERVICE_DRIVER=docker

ADD ./conf.docker /conf.docker
ADD ./conf.kubernetes /conf.kubernetes
ADD ./scripts /scripts
ADD ./system-client /app/
ADD ./app-console /app-console
ADD ./docs /docs/

CMD [ "sh", "/scripts/start.sh" ]

FROM openresty/openresty:latest
RUN apt-get update && apt-get install -y wget

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

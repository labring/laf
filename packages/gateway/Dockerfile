FROM openresty/openresty:latest

WORKDIR /app
EXPOSE 80

ADD ./conf.docker /conf.docker
ADD ./scripts /scripts

CMD [ "sh", "/scripts/start.sh" ]

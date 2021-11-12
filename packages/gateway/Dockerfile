FROM openresty/openresty:latest
RUN apt-get update && apt-get install -y wget

# ENV DOCKERIZE_VERSION v0.6.1
# RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
#   && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
#   && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

WORKDIR /app
EXPOSE 80
ADD ./system.conf /etc/nginx/templates/system.conf.template
ADD ./app.conf /etc/nginx/templates/app.conf.template
ADD ./scripts /scripts

ADD ./dist /app/

CMD [ "sh", "/scripts/start.sh" ]

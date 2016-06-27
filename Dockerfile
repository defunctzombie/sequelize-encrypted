FROM mhart/alpine-node:6.2.2

WORKDIR /app
ADD package.json /app/
RUN npm install

ADD . /app/


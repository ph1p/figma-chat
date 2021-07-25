FROM node:16.5.0-alpine

ARG VERSION
ENV VERSION=$VERSION

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only-prod

COPY ./dist/server.js ./dist/

CMD [ "npm", "start" ]
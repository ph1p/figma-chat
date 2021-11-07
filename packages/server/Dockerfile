FROM node:16.5.0-alpine

ARG VERSION
ENV VERSION=$VERSION

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install --production

COPY ./dist/server.js ./dist/

CMD [ "npm", "run", "start:docker" ]
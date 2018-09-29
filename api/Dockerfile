FROM node:10

WORKDIR /opt/web-app/api

COPY yarn.lock package.json ./

RUN yarn install --pure-lockfile

COPY src ./src
COPY config ./config

CMD node ./src/app.js
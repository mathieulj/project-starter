FROM node:10

WORKDIR /opt/web-app/client

COPY yarn.lock package.json ./

RUN yarn install --pure-lockfile

COPY public ./public
COPY src ./src

CMD yarn start

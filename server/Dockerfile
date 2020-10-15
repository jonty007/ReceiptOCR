FROM node:12.16

WORKDIR /usr/app

COPY package.json .
COPY package-lock.json .

RUN npm i --quiet

COPY . .

ARG APP_ENV
ENV NODE_ENV=${APP_ENV}

RUN echo running for env: $NODE_ENV;

# RUN npm run client:install

# commenting below as we will build & commit (by developer)
# then copy dist folder, otherwise docker should be large enough to build
# RUN npm run client:build:dev

RUN npm install pm2 -g

EXPOSE 4001
CMD ["sh", "-c", "pm2-runtime start ./start.js"]

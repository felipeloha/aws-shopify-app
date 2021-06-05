FROM node:10.24.1-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm ci --only=production
RUN npm run build

EXPOSE 8081

USER node
CMD npm run start
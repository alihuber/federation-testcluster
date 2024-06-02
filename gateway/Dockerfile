FROM node:22-alpine3.20

RUN apk update && apk add ca-certificates && apk add bash && apk add dumb-init && rm -rf /var/cache/apk/*

# app directory
WORKDIR /usr/src/app

# run code as unprivileged user
RUN chown -R node:node /usr/src/app

COPY --chown=node:node . .

ENV NODE_ENV=production

ENV HOST_IP=192.168.0.102

RUN npm ci --omit=dev

USER node

RUN npm run build

CMD ["dumb-init", "npm", "start"]
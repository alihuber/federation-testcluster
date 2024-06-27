FROM node:22-alpine3.20

RUN apk update && apk add ca-certificates bash curl dumb-init && rm -rf /var/cache/apk/*

# app directory
WORKDIR /usr/src/app

# run code as unprivileged user
RUN chown -R node:node /usr/src/app

COPY --chown=node:node . .

ENV NODE_ENV=production

# switch between router and gateway
# ENV GATEWAY_ORIGIN=http://gateway:4000
ENV GATEWAY_ORIGIN=http://router:4000
ENV MONGODB_URL="mongodb://federationuser:federationpw@mongo-service:27017/federation?authSource=federation"

RUN npm ci --omit=dev

USER node

RUN npm run build

CMD ["dumb-init", "npm", "start"]
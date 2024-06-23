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
ENV DATABASE_URL="postgresql://postgres:admin@pg-service:5432/federation"
ENV PW_SECRET="028b5025fbfe52ee78f7af7a6ca2d772"

RUN npm ci --omit=dev

USER node

RUN npm run build

CMD ["dumb-init", "npm", "start"]
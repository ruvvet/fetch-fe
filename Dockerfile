# Base image
FROM node:18-bullseye-slim as base

WORKDIR /app

COPY package*.json ./

FROM base AS deps

RUN npm ci

# build on top of deps
FROM deps AS builder

WORKDIR /app

COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app 

# copy artifacts from previous stages
COPY --from=builder --chown=remix:remix /app/package*.json ./
COPY --from=builder --chown=remix:remix /app/node_modules ./node_modules
COPY --from=builder --chown=remix:remix /app/build ./build
COPY --from=builder --chown=remix:remix /app/public ./public
COPY --from=builder --chown=remix:remix /app/. ./

RUN npm install --omit=dev
EXPOSE 3000

CMD ["npm", "run", "start-prod"]
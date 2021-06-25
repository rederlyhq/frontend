FROM node:14.15.3-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
COPY . ./
RUN REDERLY_PACKAGER_ARCHIVE=false REDERLY_PACKAGER_PRUNE_DEPENDENCIES=false npm run build:package

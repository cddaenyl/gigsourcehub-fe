# Stage 1
FROM node:22-alpine AS build

WORKDIR /usr/src/app

ARG VITE_BASE_API_URL
ARG VITE_APP_TITLE

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@10.2.0
RUN pnpm install

COPY . .

RUN pnpm build

# Stage 2
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY /deployment/config/nginx.conf /etc/nginx/conf.d
COPY /deployment/config/docker-entrypoint.sh /usr/local/bin/
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
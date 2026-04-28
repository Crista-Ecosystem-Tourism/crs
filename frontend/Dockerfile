# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS build
WORKDIR /app

ENV CI=true \
    npm_config_fund=false \
    npm_config_audit=false

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

COPY . .

ARG VITE_API_URL=/api
ARG VITE_GRAPH_API_URL=/graph-api
ARG VITE_SUITCASE_API_URL=/suitcase-api
ARG VITE_USE_MOCKS=false
ENV VITE_API_URL=$VITE_API_URL \
    VITE_GRAPH_API_URL=$VITE_GRAPH_API_URL \
    VITE_SUITCASE_API_URL=$VITE_SUITCASE_API_URL \
    VITE_USE_MOCKS=$VITE_USE_MOCKS

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

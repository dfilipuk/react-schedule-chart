FROM node:16 as builder
WORKDIR /app
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install
COPY . .
RUN yarn build-storybook

FROM nginx:1.21.3-alpine
EXPOSE 80
COPY --from=builder /app/storybook-static /usr/share/nginx/html
# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# install deps (no lockfile)
COPY package.json ./
RUN npm install

# copy source
COPY . .

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# custom nginx config to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

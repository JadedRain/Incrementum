FROM node:20-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --shamefully-hoist

COPY . .

# Vite reads VITE_* values at build time.
ARG VITE_API_BASE_URL=https://api.incremy.duckdns.org
ARG VITE_DASH_BASE_URL=https://api.incremy.duckdns.org:8050
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DASH_BASE_URL=$VITE_DASH_BASE_URL

RUN pnpm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
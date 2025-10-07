FROM node:20-alpine AS BUILD

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --shamefully-hoist

COPY . .

EXPOSE 5173

CMD ["pnpm", "run", "dev", "--host"]
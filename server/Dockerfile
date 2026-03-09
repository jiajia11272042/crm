FROM node:20-slim

RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    libcurl4 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

RUN npx prisma db push --accept-data-loss

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/index.js"]

# Development image for the API (see compose.dev.yaml).
FROM node:22-slim

# Prisma's migration engine needs OpenSSL, which the slim image does not have.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencies first: this layer is reused until package*.json changes.
COPY package*.json ./
RUN npm ci

COPY . .

# Generating the client does not connect to the database, but the Prisma
# config requires DATABASE_URL to be set.
RUN DATABASE_URL="mysql://build:build@localhost:3306/build" npx prisma generate

EXPOSE 5000

CMD ["npm", "run", "dev"]

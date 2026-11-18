# Development image for the React app (see compose.dev.yaml).
FROM node:22-slim

WORKDIR /app

# Dependencies first: this layer is reused until package*.json changes.
COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# --host: listen on all interfaces, otherwise Vite is unreachable from
# outside the container.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

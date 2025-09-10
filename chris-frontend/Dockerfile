# Stage 1: Build the React application
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY bun.lockb package.json ./

RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.27-alpine

# Copy the build output from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

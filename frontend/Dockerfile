# Stage 0: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Install sharp dependencies for Alpine
RUN apk add --no-cache libc6-compat

# Copy shared package first (for the file: reference)
COPY shared ./shared

# Copy frontend files
COPY frontend/package.json frontend/package-lock.json ./
# Update package-lock to handle file: reference
RUN npm install

# Copy source files
COPY frontend ./

# Build the app
RUN npm run build

# Stage 1: Production runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone build output
COPY --from=builder /app/.next/standalone ./
# Copy static assets (not included in standalone)
COPY --from=builder /app/.next/static ./.next/static
# Copy public folder
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

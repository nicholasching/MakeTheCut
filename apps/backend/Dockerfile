# Stage 0: Prune
FROM node:22-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Generates a pruned version of the monorepo in /app/out
RUN turbo prune backend --docker

# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

# 1. Install dependencies based on the pruned lockfile
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# 2. Build the project
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=backend

# 3. Create a production-ready isolated folder
# This replaces your manual 'pnpm deploy' from the old version
RUN pnpm --filter backend --prod deploy --legacy /prod/backend

# Stage 2: Production Runner
FROM node:22-alpine AS runner

# Install Infisical
USER root
RUN apk add --no-cache curl bash sudo \
    && curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' \
    | distro=alpine version=3.19 bash \
    && apk add infisical

WORKDIR /app
ENV NODE_ENV=prod

# Copy the isolated production dependencies/package from the deploy step
COPY --from=builder /prod/backend ./

# Copy the build artifacts specifically
# In a turbo prune, the source is at /app/apps/backend/build (or /app/backend/build depending on your root)
# Based on your previous COPY, we target the backend folder's build output:
COPY --from=builder /app/backend/build ./build
COPY --from=builder /app/backend/docker-entrypoint.sh ./entrypoint.sh

# Fix line endings (CRLF -> LF) for Windows users
RUN sed -i 's/\r$//' ./entrypoint.sh && chmod +x entrypoint.sh

USER node

ENTRYPOINT ["./entrypoint.sh"]
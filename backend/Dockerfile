# Stage 1: Build
FROM node:25-alpine AS builder

WORKDIR /app

# Install dependencies based on lock files
COPY package.json pnpm-lock.yaml* package-lock.json* ./
# Install only production dependencies usually, but we need devDeps for build (tsc)
# So install all, build, then prune.
RUN if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; \
    fi

COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Production Runner
FROM node:25-alpine AS runner

## First we install infisical for secrets
# 1. Install dependencies
USER root
RUN apk add --no-cache curl bash sudo \
    && curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' \
    | distro=alpine version=3.19 bash \
    && apk add infisical

WORKDIR /app

ENV NODE_ENV=prod

# Copy package.json and install ONLY production dependencies
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --prod --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci --only=production; \
    else npm install --only=production; \
    fi


# Copy built assets from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/docker-entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

# Basic user security
USER node
ENTRYPOINT ["./entrypoint.sh"]

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Copy root config
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# Copy package definitions
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

# Install dependencies (all)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY backend ./backend
COPY shared ./shared

# Build backend
# We ensure the shared package is built if needed (it's TS only so maybe not, but good practice)
RUN pnpm --filter backend build

# Use pnpm deploy to create a production-ready isolated package
RUN pnpm --filter backend --prod deploy --legacy /prod/backend

# Stage 2: Production Runner
FROM node:22-alpine AS runner

# Install Infisical (Copied from original Dockerfile)
USER root
RUN apk add --no-cache curl bash sudo \
    && curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' \
    | distro=alpine version=3.19 bash \
    && apk add infisical

WORKDIR /app
ENV NODE_ENV=prod

# Copy the deployed application from builder
COPY --from=builder /prod/backend ./

# Copy build artifacts (if pnpm deploy didn't include them - usually it includes files in 'files' or what's present?)
# pnpm deploy copies package.json and installs deps. It does NOT run build scripts usually.
# So we usually need to copy the 'dist' or 'build' folder ourselves.
COPY --from=builder /app/backend/build ./build
COPY --from=builder /app/backend/docker-entrypoint.sh ./entrypoint.sh

# Fix line endings (CRLF -> LF) for Windows users
RUN sed -i 's/\r$//' ./entrypoint.sh && chmod +x entrypoint.sh

USER node

ENTRYPOINT ["./entrypoint.sh"]

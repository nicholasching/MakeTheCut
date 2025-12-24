# Backend of MTC

## Installation
1. `npm install`

## Running the backend
**Use docker compose.**

## Deploying in prod
**Use docker compose with NODE_ENV=prod**

## Docker Compose

**Running the compose:** 
1. `cd` to the directory containing compose.yaml
2. Create `.env` based on `.env.example` (you will need to generate an infisical machine client id and secret)
3. `docker compose up`

**Rebuilding the backend only**
`docker compose up -d --build backend`

### Pino Logging
The pino logger is default exported from `logger.ts` located in `src`
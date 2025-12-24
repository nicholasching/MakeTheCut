# Backend of MTC

## Installation
1. `npm install`


## Running the backend
1. `infisical login` (if you haven't already done so)
2. `infisical run -- npm run dev`

## Deploying in prod
1. `npm run build`
2. Ensure `.env` exists in the root directory according to `env.d.ts` so infisical can pick it up and get secrets

## Docker Compose

**Running the compose:** 
1. `cd` to the directory containing compose.yaml
2. Create `.env` based on `.env.example` (you will need to generate an infisical machine client id and secret)
3. `docker compose up`

**Rebuilding the backend only**
`docker compose up -d --build backend`

- asdasd

### Pino Logging
The pino logger is default exported from `pino.ts` located in `src`
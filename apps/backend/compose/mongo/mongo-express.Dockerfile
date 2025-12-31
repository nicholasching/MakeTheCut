FROM mongo-express:latest

# 1. Install dependencies
USER root
RUN apk add --no-cache curl bash sudo

# 2. Install Infisical CLI
# We use 'update' after the script to ensure the new repo is indexed
RUN curl -1sLf \
	'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' \
	| bash \
    && apk update \
    && sudo apk add infisical

# 3. Copy and fix permissions for the entrypoint
# Note: Ensure the filename matches what you have on your disk
COPY mongo-express-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/mongo-express-entrypoint.sh

# Switch back to the non-root user for security
USER node

ENTRYPOINT ["/usr/local/bin/mongo-express-entrypoint.sh"]
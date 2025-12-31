# Use the official MongoDB version (Ubuntu 24.04 base)
FROM mongo:8.2-noble

# 1. Install dependencies and Infisical CLI
RUN apt-get update && apt-get install -y curl sudo && rm -rf /var/lib/apt/lists/*
RUN curl -1sLf 'https://artifacts-cli.infisical.com/setup.deb.sh' | sudo -E bash \
    && apt-get update && apt-get install -y infisical

# 3. Setup our custom entrypoint script
COPY mongo-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/mongo-entrypoint.sh

# 4. Define the entrypoint and default command
ENTRYPOINT ["/usr/local/bin/mongo-entrypoint.sh"]

EXPOSE 27017
CMD ["mongod"]
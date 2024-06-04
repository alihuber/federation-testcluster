# modified from
# https://github.com/apollographql/router/blob/dev/dockerfiles/Dockerfile.router
FROM debian:bookworm-slim AS downloader
ARG ROUTER_RELEASE=latest

# Install curl
RUN \
  apt-get update -y \
  && apt-get install -y \
  curl

WORKDIR /dist

# Run the Router downloader which puts Router into current working directory
RUN curl -sSL https://router.apollo.dev/download/nix/${ROUTER_RELEASE}/ | sh

FROM debian:bookworm-slim AS distro
# Add a user to run the router as
RUN useradd -m router

WORKDIR /dist

COPY --from=downloader /dist/router /dist

# Update apt and install ca-certificates
RUN \
  apt-get update -y \
  && apt-get install -y \
  ca-certificates

# Clean up apt lists
RUN rm -rf /var/lib/apt/lists/*

# Make directories for config and schema
RUN mkdir config schema

# Copy configuration for docker image
COPY router.yaml config
COPY supergraph.graphql schema

ENV APOLLO_ROUTER_CONFIG_PATH="/dist/config/router.yaml"

# Create a wrapper script to run the router, use exec to ensure signals are handled correctly
RUN \
  echo '#!/usr/bin/env bash \
  \nset -e \
  \n \
  \nif [ -f "/usr/bin/heaptrack" ]; then \
  \n    exec heaptrack -o /dist/data/router_heaptrack /dist/router "$@" \
  \nelse \
  \n    exec /dist/router --config /dist/config/router.yaml -s /dist/schema/supergraph.graphql "$@" \
  \nfi \
  ' > /dist/router_wrapper.sh

# Make sure we can run our wrapper
RUN chmod 755 /dist/router_wrapper.sh

USER router

# Default executable is the wrapper script
ENTRYPOINT ["/dist/router_wrapper.sh"]

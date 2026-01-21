#!/bin/bash

docker compose -f docker-compose.prod.yml run --rm --remove-orphans frontend npm run build

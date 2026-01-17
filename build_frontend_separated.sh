#!/bin/bash

docker compose -f docker-compose.prod.yml run --rm frontend npm run build

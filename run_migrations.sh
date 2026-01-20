#!/bin/bash

docker compose -f docker-compose.prod.yml run backend npm run migrate:latest
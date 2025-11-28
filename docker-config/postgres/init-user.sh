#!/usr/bin/env bash
set -euo pipefail

PG_PW=$(cat /run/secrets/postgres_password)
APP_PW=$(cat /run/secrets/fortress_app_password)

psql -v ON_ERROR_STOP=1 --username postgres <<SQL
ALTER USER postgres WITH PASSWORD '${PG_PW}';
CREATE USER fortress_app WITH PASSWORD '${APP_PW}';
CREATE DATABASE fortress OWNER fortress_app;
GRANT ALL PRIVILEGES ON DATABASE fortress TO fortress_app;
SQL

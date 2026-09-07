#!/usr/bin/env bash
# Per-boot runtime initialization: bring up MariaDB, ensure the app database and
# user exist, write a local .env if missing, then apply migrations and seed demo
# data. Every step is idempotent and the script returns once the DB is ready
# (the dev server itself runs from the `next-dev` terminal, not here).
set -euo pipefail

cd "$(dirname "$0")/.."

# Start MariaDB if it is not already accepting connections.
if ! sudo mysqladmin ping >/dev/null 2>&1; then
  sudo mkdir -p /var/run/mysqld
  sudo chown mysql:mysql /var/run/mysqld
  sudo bash -c 'nohup mysqld_safe --datadir=/var/lib/mysql >/tmp/mariadb.log 2>&1 &'
  for _ in $(seq 1 60); do
    if sudo mysqladmin ping >/dev/null 2>&1; then break; fi
    sleep 1
  done
fi

# Ensure the application database and user exist (dedicated user avoids the
# root@localhost unix_socket auth collision on TCP connections).
sudo mysql <<'SQL'
CREATE DATABASE IF NOT EXISTS voltpim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'voltpim'@'%' IDENTIFIED BY 'voltpim';
CREATE USER IF NOT EXISTS 'voltpim'@'localhost' IDENTIFIED BY 'voltpim';
GRANT ALL PRIVILEGES ON voltpim.* TO 'voltpim'@'%';
GRANT ALL PRIVILEGES ON voltpim.* TO 'voltpim'@'localhost';
FLUSH PRIVILEGES;
SQL

# Create a local .env on first boot. AUTH_SECRET is generated per environment and
# is not committed to the repository.
if [ ! -f .env ]; then
  cat > .env <<EOF
DATABASE_URL="mysql://voltpim:voltpim@127.0.0.1:3306/voltpim"
AUTH_SECRET="$(openssl rand -base64 32)"
AUTH_URL="http://localhost:3000"
EOF
fi

# Apply schema and seed demo data only when the DB is empty (both idempotent).
npx prisma migrate deploy
node prisma/seed-if-empty.js

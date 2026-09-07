#!/usr/bin/env bash
# Durable repository setup: system packages, database data dir, and node deps.
# Runs after source checkout. Must be idempotent — it may run repeatedly and
# (with environment builds) it produces the baseline snapshot.
set -euo pipefail

cd "$(dirname "$0")/.."

# System dependency: MariaDB (Prisma "mysql" provider is wire-compatible).
if ! command -v mariadbd >/dev/null 2>&1 && ! command -v mysqld >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mariadb-server mariadb-client
fi

# Initialize the database data directory once.
sudo mkdir -p /var/lib/mysql /var/run/mysqld
sudo chown -R mysql:mysql /var/lib/mysql /var/run/mysqld
if [ ! -d /var/lib/mysql/mysql ]; then
  sudo mariadb-install-db --user=mysql --datadir=/var/lib/mysql >/dev/null
fi

# Node dependencies. `postinstall` runs `prisma generate`.
npm ci

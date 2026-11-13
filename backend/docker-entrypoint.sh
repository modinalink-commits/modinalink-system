#!/bin/sh
set -e
cd /var/www/html
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs
chown -R www-data:www-data storage bootstrap/cache
# Only the web container migrates; queue and scheduler containers set RUN_MIGRATIONS=0.
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  php artisan migrate --force
  php artisan db:seed --force
  php artisan config:cache
  php artisan route:cache
fi
exec "$@"

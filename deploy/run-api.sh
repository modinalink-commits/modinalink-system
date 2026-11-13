#!/bin/sh
# Runs inside php:8.3-apache. Fetches the backend from GitHub, installs, migrates, then serves.
# Also runs the SMS queue worker and the scheduler in the same container.
set -e
export DEBIAN_FRONTEND=noninteractive COMPOSER_ALLOW_SUPERUSER=1
REPO=modinalink-commits/modinalink-system
APP=/var/www/html

if [ ! -f /usr/local/.ml-ready ]; then
  apt-get update -qq
  apt-get install -y -qq git unzip curl libzip-dev libicu-dev >/dev/null
  docker-php-ext-install -j2 pdo_mysql bcmath intl zip >/dev/null
  a2enmod rewrite headers >/dev/null
  sed -ri 's#/var/www/html#/var/www/html/public#g' /etc/apache2/sites-available/000-default.conf
  curl -fsSL https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer >/dev/null
  touch /usr/local/.ml-ready
fi

rm -rf /tmp/src && mkdir -p /tmp/src
curl -fsSL "https://codeload.github.com/$REPO/tar.gz/refs/heads/main" | tar xz -C /tmp/src --strip-components=2 "modinalink-system-main/backend"
cp -a /tmp/src/. "$APP"/
cd "$APP"
composer install --no-dev --optimize-autoloader --no-interaction
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
php artisan config:clear >/dev/null 2>&1 || true
until php artisan migrate --force; do echo "waiting for database..."; sleep 5; done
php artisan db:seed --force
php artisan config:cache
php artisan route:cache

(while true; do su -s /bin/sh www-data -c "php artisan queue:work --sleep=3 --tries=3 --max-time=3600" || true; sleep 3; done) &
(while true; do su -s /bin/sh www-data -c "php artisan schedule:work" || true; sleep 3; done) &
exec apache2-foreground

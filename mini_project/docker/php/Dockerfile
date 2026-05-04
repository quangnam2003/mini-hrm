# Stage 1: Build extensions
FROM php:8.3-fpm-alpine AS builder

RUN apk add --no-cache --virtual .deps \
        libpng-dev libjpeg-turbo-dev freetype-dev libwebp-dev oniguruma-dev libzip-dev $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) pdo_mysql mbstring gd bcmath exif pcntl zip opcache \
    && pecl install redis && docker-php-ext-enable redis

# Stage 2: Runtime
FROM php:8.3-fpm-alpine

RUN apk add --no-cache libpng libjpeg-turbo freetype libwebp oniguruma libzip

COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
CMD php artisan serve --host=0.0.0.0 --port=8080

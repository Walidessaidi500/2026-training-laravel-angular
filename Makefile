start:
	docker compose up -d

stop:
	docker compose down

restart: stop start

recreate:
	docker compose down
	docker compose up -d --build

status:
	docker compose ps

install:
	docker compose exec api composer install

install-laravel:
	docker compose run --rm api bash -c "composer create-project laravel/laravel /var/www"

install-frontend:
	docker compose run --rm -v $(PWD):/workspace -w /workspace frontend sh -c "npx -y @angular/cli@20 new frontend --defaults"

db-migrate:
	docker compose exec api php artisan migrate

test:
	docker compose exec api php artisan test

lint:
	docker compose exec api vendor/bin/pint

logs-backend:
	docker compose exec -it api sh -c "touch storage/logs/laravel.log && less +F storage/logs/laravel.log"

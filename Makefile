lint:
	@echo "Starting JSHINT..."
	jshint server/app.js bin/www
setup:
	@echo "Creating external node_modules directory..."
	docker volume create node_modules
dev: 
	@echo "Starting development environment..."
	docker-compose up 
clean-build: 
	@echo "Cleaning up development environment..."
	docker-compose rm -vf
	@echo "Creating new development environment..."
	docker-compose up --build 

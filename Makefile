.PHONY: validate test build run deploy

PORT ?= 8080
HOST ?= 127.0.0.1

validate:
	npm run validate:catalog

test:
	npm test

build:
	npm run build

run: build
	python3 -m http.server $(PORT) --bind $(HOST) -d dist

deploy: validate test build

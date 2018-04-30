clean:
	rm -rf node_modules

init:
	npm i

default:
	@ init

test:
	npm test

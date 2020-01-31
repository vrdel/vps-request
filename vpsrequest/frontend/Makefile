container_name = vps-request

devel:
	docker exec -t $(container_name) ./wrap_make.sh devel-container
	docker exec -t $(container_name) ./collectstatic.sh
	docker exec -u root -t $(container_name) ./restarthttpd.sh

prod:
	docker exec -t $(container_name) ./wrap_make.sh prod-container
	docker exec -t $(container_name) ./collectstatic.sh
	docker exec -u root -t $(container_name) ./restarthttpd.sh

devel-container:
	rm -rf bundles/reactbundle/* ; \
	node_modules/.bin/webpack --config webpack.config.js --progress --mode development

prod-container:
	rm -rf bundles/reactbundle/* ; \
	node_modules/.bin/webpack --config webpack.config.js --progress --mode production


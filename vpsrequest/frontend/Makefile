container_name = vps-request

devel-container:
	rm -rf bundles/reactbundle/* ; \
	node_modules/.bin/webpack --config webpack.config.js --progress --mode development

prod-container:
	rm -rf bundles/reactbundle/* ; \
	node_modules/.bin/webpack --config webpack.config.js --progress --mode production

devel:
	docker exec -ti $(container_name) ./bundle_create.sh devel-container
	docker exec -ti $(container_name) ./collectstatic.sh

prod:
	docker exec -ti $(container_name) ./bundle_create.sh prod-container
	docker exec -ti $(container_name) ./collectstatic.sh

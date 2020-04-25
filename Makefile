wheel:
	python setup.py bdist_wheel

sdist:
	python setup.py sdist

clean:
	python setup.py clean --all
	rm -rf build/
	rm -rf dist
	rm -rf vpsrequest.egg-info/

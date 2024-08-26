BRANCH := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: all
all:  buildSite deploy

buildSite:
	bundle exec jekyll clean
	bundle exec jekyll build

deploy:
	rm -fr _site/data
	@if [ $(BRANCH) = "master" ]; \
	then\
		aws s3 cp _site s3://www.darrenshaw.org/ --recursive --profile shawdm-darrenshaw-org; \
	else \
		echo "Cannot depoloy from branch: $(BRANCH)"; \
	fi
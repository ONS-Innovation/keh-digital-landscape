.PHONY: setup
setup:
	python3 -m pip install -r mkdocs_requirements.txt

.PHONY: setup-dev
setup-dev:
	python3 -m pip install -r mdformat_requirements.txt

.PHONY: mkdocs
mkdocs:  ## Run mkdocs.
	PYTHONPATH=.. mkdocs serve

.PHONY: mkdocs-build
mkdocs-build:  ## Build mkdocs.
	PYTHONPATH=.. mkdocs build

.PHONY: mkdocs-deploy
mkdocs-deploy:  ## Deploy mkdocs to GitHub Pages.
	PYTHONPATH=.. mkdocs gh-deploy

.PHONY: lint
lint:  ## Lint markdown files.
	mdformat --check docs/

.PHONY: lint-fix
lint-fix:  ## Fix markdown formatting.
	mdformat docs/

.PHONY: clean
clean:
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type f -name "*.pyc" -delete 
	rm -rf .pytest_cache
	rm -rf .ruff_cache
	rm -rf venv

.PHONY: setup test test-main test-admin test-review clean lint ruff pylint

setup:
	python3 -m pip install -r requirements.txt

test: # Run all tests
	python3 -m pytest src/test_*.py -v

test-main: # Run only the main API tests
	python3 -m pytest src/test_main.py -v

test-admin: # Run only the admin API tests
	python3 -m pytest src/test_admin.py -v

test-review: # Run only the review API tests
	python3 -m pytest src/test_review.py -v

test-copilot: # Run only the copilot API tests
	python3 -m pytest src/test_copilot.py -v

ruff:
	python3 -m ruff check src/test_*.py

autopep8:
	python3 -m autopep8 --in-place src/test_*.py

ruff-fix:
	python3 -m ruff check --fix src/test_*.py

pylint:
	python3 -m pylint src/test_*.py || true

lint:
	make ruff
	make pylint

lint-fix:
	make ruff-fix
	make autopep8
	make pylint

clean:
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type f -name "*.pyc" -delete 
	rm -rf .pytest_cache
	rm -rf .ruff_cache
	rm -rf venv

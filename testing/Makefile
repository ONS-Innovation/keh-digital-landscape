.PHONY: setup test test-main test-admin test-review clean lint ruff pylint

setup:
	python3 -m pip install -r requirements.txt

test: # Run all tests
	python3 -m pytest backend/test_*.py -v

test-main: # Run only the main API tests
	python3 -m pytest backend/test_main.py -v

test-admin: # Run only the admin API tests
	python3 -m pytest backend/test_admin.py -v

test-review: # Run only the review API tests
	python3 -m pytest backend/test_review.py -v

ruff:
	python3 -m ruff check backend/test_*.py

autopep8:
	python3 -m autopep8 --in-place backend/test_*.py

ruff-fix:
	python3 -m ruff check --fix backend/test_*.py

pylint:
	python3 -m pylint backend/test_*.py || true

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

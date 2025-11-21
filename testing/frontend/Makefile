setup:
	npm install && npx playwright install --with-deps chromium

test:
	node test.js wcag2a wcag2aa wcag21a wcag21aa

test-all:
	node test.js

test-ui:
	npx playwright test

clean:
	rm -rf reports
	rm -rf test-results

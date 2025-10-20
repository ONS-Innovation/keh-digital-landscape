# Digital Landscape MkDocs

This directory contains the documentation using MkDocs in Python.

## Prerequisites

- Python 3.8 or higher
- Make (for using Makefile commands)

Make sure you are currently in the /testing directory when running the commands. To change directory, run:

```bash
cd mkdocs
```

## Setup

1. Create a virtual environment (recommended but not required):
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
make setup
```

## Running locally

To run the documentation locally:
```bash
make mkdocs
```

## Making changes to the documentation

Ensure you are running locally.

To make changes to the documentation, edit the `mkdocs.yml` file to add a new page and add markdown (.md) files or directories to the `docs` directory.

Your changes will be reflected live locally.

## Deploying to GitHub Pages

### GitHub Action Deployment

The MkDocs documentation is automatically deployed to the `gh-pages` branch of the repository using a GitHub Action. The action is triggered on every push to the `main` branch. This action is defined within `./.github/workflows/deploy_mkdocs.yml`.

### Manual Deployment

To deploy to GitHub Pages, you can run the following:

```bash
make mkdocs-deploy
```

This will build the documentation and deploy it to the `gh-pages` branch of the repository.
The GitHub Pages site will then be updated with the latest changes from the `gh-pages` branch.

## Linting

Install developer dependencies with:

```bash
make setup-dev
```

To lint markdown files for style issues:

```bash
make lint
```

To automatically fix markdown formatting:

```bash
make lint-fix
```

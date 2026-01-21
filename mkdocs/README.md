# Digital Landscape MkDocs

This directory contains the documentation using MkDocs in Python.

## Prerequisites

- Python 3.8 or higher
- Node.js 16+ (for Prettier markdown linting and formatting)
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

## Testing the build

Before merging a PR into `main`, it is important that we double check that MkDocs builds successfully.

### Manually Testing Build

To do this, run the following (assuming you are already in the `./mkdocs` directory):

```bash
PYTHONPATH=. mkdocs build
```

This will create a `./site` directory containing the source files for the documentation site.
If the build is successful, MkDocs will provide a success message:

```bash
INFO    -  Documentation built in 2.62 seconds
```

### GitHub Action Build Testing

A GitHub Action is available in `.github/workflows/ci_mkdocs.yml`.

This action will run on pull request to the `main` branch and simply follows the above process to catch build errors (it also handles automated linting - see below).

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

## Linting & Formatting

The mkdocs documentation uses **Prettier** for markdown linting and formatting.

### Prerequisites for Linting

Install developer dependencies with:

```bash
make setup-dev
```

### Check markdown formatting issues

To lint markdown files and check for formatting issues without making changes:

```bash
make lint
```

### Automatically fix markdown formatting

To automatically fix markdown formatting issues:

```bash
make lint-fix
```

# Contributing

Thanks for your interest in contributing to the Digital Landscape. We're happy to have you here.

Please take a moment to review this document before submitting your first pull request. We also strongly recommend that you check for open issues and pull requests to see if someone else is working on something similar.

If you need any help, feel free to reach out to the development team.

## About this repository

This repository is for the Digital Landscape tool.

- We use [npm](https://www.npmjs.com/) for dependency management.
- We use a Makefile for common development tasks.

## Structure

This repository is structured as follows:

```
backend/
frontend/
concourse/
mkdocs/
terraform/
testing/
```

| Path         | Description                                       |
| ------------ | ------------------------------------------------- |
| `backend/`   | The Node.js Express API.                          |
| `frontend/`  | The React.js frontend application.                |
| `concourse/` | Concourse CI pipeline configurations and scripts. |
| `mkdocs/`    | Project documentation built with MkDocs.          |
| `terraform/` | Terraform configurations for infrastructure.      |
| `testing/`   | Backend (PyTest) and frontend (Playwright) tests. |

## Development

### Fork this repo

You can fork this repo by clicking the fork button in the top right corner of this page.

### Clone on your local machine

```bash
git clone https://github.com/ONS-innovation/keh-digital-landscape.git
```

### Navigate to project directory

```bash
cd keh-digital-landscape
```

### Create a new Branch

```bash
git checkout -b my-new-branch
```

### Install dependencies

To install both backend and frontend dependencies, run:

```bash
make install-dev
```

### Running locally

To run the project locally (frontend and backend together):

```bash
make dev
```

This runs the frontend and backend locally on ports 3000 and 5001 respectively.

To run the frontend only:

```bash
make frontend
```

To run the backend only:

```bash
make backend
```

## Documentation

The project documentation is located in the `mkdocs/docs` directory.

You can build and serve the documentation locally by navigating to the `mkdocs/` directory and running:

```bash
pip install -r mkdocs_requirements.txt
mkdocs serve
```

Documentation is written using Markdown.

## Commit Convention

Before you create a Pull Request, please check whether your commits comply with
the commit conventions used in this repository.

When you create a commit we kindly ask you to follow the convention
`category(scope or module): message` in your commit message while using one of
the following categories:

- `feat / feature`: all changes that introduce completely new code or new
  features
- `fix`: changes that fix a bug (ideally you will additionally reference an
  issue if present)
- `refactor`: any code-related change that is not a fix nor a feature
- `docs`: changing existing or creating new documentation (i.e. README, docs for
  usage of a library or CLI usage)
- `build`: all changes regarding the build of the software, changes to
  dependencies or the addition of new dependencies
- `test`: all changes regarding tests (adding new tests or changing existing
  ones)
- `ci`: all changes regarding the configuration of continuous integration (i.e.
  GitHub Actions, CI system)
- `chore`: all changes to the repository that do not fit into any of the above
  categories

  e.g. `feat(components): add new prop to the avatar component`

If you are interested in the detailed specification you can visit
https://www.conventionalcommits.org/ or check out the
[Angular Commit Message Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

## Pull Request Template

Please squash your commits into a single commit when merging your pull request.

Ensure the title of the pull request is descriptive, concise and follows the branch naming convention.

```bash
TICKET-NUMBER-description
```

e.g. `KEH-123 - Added new feature`

## Branch Naming Convention

Please use the following naming convention for your branches:

```bash
TICKET-NUMBER-description
```

e.g. `KEH-123-add-new-feature`

For patches or bug fixes, please use the following naming convention:

```bash
TICKET-NUMBER-PATCH-NUMBER
```

e.g. `KEH-123-patch-1`

## Testing

Backend tests are run with PyTest. Frontend tests are run with Playwright and AxeCore.

To run all tests from the root of the repository, use:

```bash
make test
```

Please ensure that all tests are passing when submitting a pull request. If you're adding new features, please include tests.

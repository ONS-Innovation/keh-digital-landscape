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

For detailed instructions on setting up your development environment and running the project locally, please refer to the [Getting started](/README.md#getting-started) and [Running locally](/README.md#running-locally) sections in the `README.md` file.

## Documentation

The project documentation is located in the `mkdocs/docs` directory. For instructions on how to build and serve the documentation locally, please refer to the [Documentation](/README.md#documentation) section in the `README.md` file.

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
TICKET-NUMBER - description
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

For detailed instructions on running tests, please refer to the [Testing](/README.md#testing) section in the `README.md` file.

## Continuous Integration

For a pull request to be merged, all Continuous Integration (CI) actions must pass. These actions ensure code quality, proper formatting, and functional correctness. Please review any failed CI checks and address the reported issues before requesting a merge.

Please ensure that all tests are passing when submitting a pull request. If you're adding new features, please include tests.

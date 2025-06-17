# Digital Landscape

![Linting Status](https://github.com/ONS-innovation/keh-digital-landscape/actions/workflows/ci.yml/badge.svg) 
![CodeQL Status](https://github.com/ONS-innovation/keh-digital-landscape/actions/workflows/github-code-scanning/codeql/badge.svg)
![Dependabot Status](https://github.com/ONS-Innovation/keh-digital-landscape/actions/workflows/dependabot/dependabot-updates/badge.svg)
[![LICENSE.](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](https://github.com/ONS-innovation/keh-digital-landscape/blob/main/LICENSE) 
[![GitHub pull requests](https://img.shields.io/github/issues-pr-raw/ONS-innovation/keh-digital-landscape.svg)](https://github.com/ONS-innovation/keh-digital-landscape/pulls)

This tool aims to provide a visual representation of the digital landscape at ONS. This consists of the following main pages:

**Tech Radar:**
- Tech Radar is a tool that helps you track the Infrastructure, Languages, Frameworks and Supporting Tools used in ONS repositories and then categorises them into Adopt, Trial, Assess or Hold.
- Use the following keyboard shortcuts to navigate the tech radar:
    - `2` to move up the list of technologies
    - `1`to move down the list of technologies

**Statistics:**
- This provides a collection of statistics about the language breakdown within the ONSDigital GitHub Organisation.
- Multiple filters such as Archive/Active, date filter and project filteroptions are available.
- Sort options such as Alphabetically, Most/Least Repositories, usage, size.
- Toggle options to display Tech Radar languages only and switch between Average Size and Total Size.

**Projects:**
- This displays the project data collected from the Tech Audit Tool.
- Multiple features such as alphabetically, most/least tech and tech radar ring ratio per project are available.

**Review Page**
- On the deployed version, this page is only available to users from the Cognito user pool.
- Grants a user the ability to move, edit and bring new technology on to the Radar.

**Admin Page**
- Banner management - create and manage different banners to be displayed on different pages within the Digital Landscape.
- Technology management - manage new technologies and the autocomplete list to ensure conformity between platforms.

**CoPilot Page**
- Displays both live and historical statistics on CoPilot usage within ONS.
- Statistics can be viewed organisation-wide or for a specific team.

**Home Page:**
- This is the homepage of the tool.
- It provides a brief overview of the tool and its purpose.
- Recent announcements (banners) and recent updates (github release changelog) are shown on the homepage.

## Getting started

Clone the repository:
```bash
git clone https://github.com/ONS-innovation/keh-digital-landscape.git
```

Install both backend and frontend dependencies:
```bash
make install-dev
```
## How to setup

First, ensure you have Node.js installed. It is recommended to use Node Version Manager (nvm) to manage Node.js versions:

1. Install nvm:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

2. Install Node.js using nvm:
```bash
nvm install 18.19.0
```

3. Set the Node.js version to use:
```bash
nvm use 18.19.0
```

4. Remember to export the following in the terminal that the backend is running in:
```bash
# AWS
export AWS_ACCESS_KEY_ID=<your_access_key>
export AWS_SECRET_ACCESS_KEY=<your_secret_key>
export AWS_SECRET_NAME=<your_secret_name>
export AWS_REGION=<your_region>

# Github
export GITHUB_APP_ID=<your_github_app_id>
export GITHUB_APP_CLIENT_ID=<your_github_app_client_id>
export GITHUB_ORG=<your_github_organisation>
```

Alternatively, you can use the `.env.example` file in the backend to set the environment variables. Copy the `.env.example` file to `.env` and fill in the values. Do not commit the `.env` file to the repository and do not put the secrets in the `.env.example` file.

## Running locally

To run the project locally (frontend and backend together):
```bash
make dev
```
This runs the frontend and backend locally on ports 3000 and 5001.

To run the frontend only:
```bash
make frontend
```

To run the backend only:
```bash
make backend
```

The backend, when ran locally, will bypass ALB authentication and use a developer user found in the `backend/src/services/cognitoService.js` file with the helper function `getDevUser()`. This defaults the dev user to `dev@ons.gov.uk` with the groups `admin` and `reviewer`. If you want to run locally with the dev user without the groups, you can use the following environment variable:

```bash
export DEV_USER_GROUPS=group1,group2
```

## How to deploy locally

**Prerequisites:**
- Docker
- Docker Compose
- .env files (for environment variables) set in `/backend/.env`

To run the project locally using Docker:

```bash
make docker-build
```

```bash
make docker-up
```

This should build the project and then start the project locally on port 3000 and 5001.

To stop the project:
```bash
make docker-down
```

## Testing

Tests are run with PyTest. To run the tests, refer to the [README.md](/testing/README.md) in the `/testing/` folder.

Accessing the testing is run with Playwright and AxeCore. To run the tests, refer to the [README.md](/testing_ui/README.md) in the `/testing_ui/` folder.

## Linting 

Linting is run with ESLint. To run the linting, run the following commands:

Install the dev dependencies:
```bash
make install-dev
```

Run the linting:
```bash
make lint
```

Run the linting for the frontend:
```bash
make lint-frontend
```

Run the linting for the backend:
```bash
make lint-backend
```

## Terraform
Follow these instructions in the central documenation to configure the Terraform:

[Terraform Commands](https://github.com/ONS-Innovation/keh-central-documentation/blob/d42e7b4505c0433bac4fd637a0742b4ba7ee6659/terraform/COMMANDS.md)

When deploying the new service and its resources, deploy in this order:

1. storage
2. admin
3. authentication
4. service

### Makefile

To see the available commands, run the following command:
```bash
make
```

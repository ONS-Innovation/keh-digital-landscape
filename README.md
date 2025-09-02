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

**Copilot Page**
- Displays both live and historical statistics on Copilot usage within ONS.
- Statistics can be viewed organisation-wide or for a specific team.
- On Team Usage view, it is possible to search for teams using the "Search teams" input within the header. 

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
nvm install 24.1.0
```

3. Set the Node.js version to use:
```bash
nvm use 24.1.0
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
export GITHUB_APP_CLIENT_SECRET=<your_github_app_client_secret>
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
- Docker/Colima
- Docker Compose
- .env file (for environment variables) set in `/backend/.env` (see [.env.example](./backend/.env.example))

To run the project locally using Docker:

```bash
make docker-build
```

```bash
make docker-up
```

When building the docker image, you *may* run into a memory problem. To increase the memory available to the docker container, you can use the following command:
```bash
colima start --memory 8 # 8GB of memory, adjust as needed i.e 16, 32, 64, but 8 should be enough
```

This should build the project and then start the project locally on port 3000 and 5001.

To stop the project:
```bash
make docker-down
```

## Testing

Backend tests are run with PyTest (Python). To run the tests, refer to the [README.md](/testing/backend/README.md) in the `/testing/backend/` folder.

Frontend (accessibility) tests are run with Playwright and AxeCore (JS). To run the tests, refer to the [README.md](/testing/frontend/README.md) in the `/testing/frontend/` folder. In the same [README.md](/testing/frontend/README.md#ui-tests), other UI frontend tests are run with Playwright. The tests are also part of the Github Actions under Frontend Tests.

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
2. authentication
3. service

### Makefile

To see the available commands, run the following command:
```bash
make
```
### Common Issues

1. When building the docker image, you *may* run into a memory problem. To increase the memory available to the docker container, you can use the following command:
```bash
# Stop the docker container
colima stop

# Start the docker container with more memory
colima start --memory 8 # 8GB of memory, adjust as needed i.e 16, 32, 64, but 8 should be enough
```

2. The frontend is making requests to `localhost:3000` instead of the backend `localhost:5001`. To fix this, stop the application. Ensure the environment variable is set in the terminal that is running the frontend:
```bash
# Navigate to the frontend directory
cd frontend

# Ensure the environment variable is set in the terminal that is running the frontend
export VITE_BACKEND_URL=http://localhost:5001

# Run the frontend
npm start
```

3. If the backend is returning nothing, ensure you have the correct environment variables set in the `.env` file. See the [.env.example](./backend/.env.example) file for the correct variables.

4. If all backend tests are failing, make sure that the backend is running and the environment variables are set correctly.

### Deployments with Concourse

#### Allowlisting your IP
To setup the deployment pipeline with concourse, you must first allowlist your IP address on the Concourse
server. IP addresses are flushed everyday at 00:00 so this must be done at the beginning of every working day
whenever the deployment pipeline needs to be used. Follow the instructions on the Confluence page (SDP Homepage > SDP Concourse > Concourse Login) to
login. All our pipelines run on sdp-pipeline-prod, whereas sdp-pipeline-dev is the account used for
changes to Concourse instance itself. Make sure to export all necessary environment variables from sdp-pipeline-prod (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN).

#### Setting up a pipeline
When setting up our pipelines, we use ecs-infra-user on sdp-dev to be able to interact with our infrastructure on AWS. The credentials for this are stored on
AWS Secrets Manager so you do not need to set up anything yourself.

To set the pipeline, run the following script:
```bash
chmod u+x ./concourse/scripts/set_pipeline.sh
./concourse/scripts/set_pipeline.sh digital-landscape
```
Note that you only have to run chmod the first time running the script in order to give permissions.
This script will set the branch and pipeline name to whatever branch you are currently on. It will also set the image tag on ECR to the current commit hash at the time of setting the pipeline.

The pipeline name itself will usually follow a pattern as follows: `<repo-name>-<branch-name>`
If you wish to set a pipeline for another branch without checking out, you can run the following:
```bash
./concourse/scripts/set_pipeline.sh digital-landscape <branch_name>
```

If the branch you are deploying is "main" or "master", it will trigger a deployment to the sdp-prod environment. To set the ECR image tag, you must draft a Github release pointing to the latest release of the main/master branch that has a tag in the form of vX.Y.Z. Drafting up a release will automatically deploy the latest version of the main/master branch with the associated release tag, but you can also manually trigger a build through the Concourse UI or the terminal prompt.

#### Triggering a pipeline
Once the pipeline has been set, you can manually trigger a build on the Concourse UI, or run the following command:
```bash
fly -t aws-sdp trigger-job -j digital-landscape-<branch-name>/build-and-push


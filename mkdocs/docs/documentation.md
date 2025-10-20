# Documentation

This site uses MkDocs to build its documentation and GitHub Pages for hosting.

## Format

Documentation within this project follows the following pattern:

- A `README.md` for each component
- A `/docs` folder for the project

Each `README.md` should contain:

- A description of what the component is/does
- A list of any prerequisites
- Setup instructions
- Execution instructions
- Deployment instructions

The `/docs` folder should contain:

- A description of what the project is
- An overview of how the everything fits together in the project
- An explanation of the tech stack
- Details of the underlying dataset

A majority of the information should reside within the `/docs` directory over the `README`. The `README`s in this project should be kept for concise instructions on how to use each component. Any detailed explanation should be kept within `/docs`.

## Getting MkDocs Setup

In order to build an MkDocs deployment or serve the documentation locally, we need to install MkDocs and its dependencies.

1. Navigate into the mkdocs directory.

1. Activate the virtual environment.

   ```bash
   source venv/bin/activate
   ```

1. Install MkDocs and its dependencies.

   ```bash
   pip install -r mkdocs_requirements.txt
   ```

1. You can now use MkDocs. To see a list of commands run the following:

   ```bash
   mkdocs --help
   ```

**Please Note:** Python's package manager, PIP, is required to install MkDocs. Please make sure you have Python installed beforehand.

## Updating MkDocs Deployment

### GitHub Action to Deploy Documentation

A GitHub Action is set up to automatically deploy the documentation to GitHub Pages whenever a commit is made to the `main` branch. This action is triggered by a push event to the `main` branch and runs the `mkdocs gh-deploy` command to build and deploy the documentation.

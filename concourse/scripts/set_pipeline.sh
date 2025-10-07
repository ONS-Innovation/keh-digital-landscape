#!/bin/bash
set -eo pipefail
# Usage: ./set_pipeline.sh

# Define repository name
repo_name="digital-landscape"
# Always use the current branch
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || { echo "Failed to get branch name"; exit 1; })

if ! git rev-parse --verify "${branch}" >/dev/null 2>&1; then
    echo "Branch \"${branch}\" does not exist. Cannot set a pipeline without a valid branch."
    exit 1
fi


if [[ ${branch} == "main" || ${branch} == "master" ]]; then
    tag=$(git tag | tail -n 1)
    pipeline_name=${repo_name}
else
    # Remove non-alphanumeric characters and take the first 7 characters
    tag=$(echo "${branch}" | tr -cd '[:alnum:]' | cut -c1-7)
    pipeline_name=${repo_name}-${branch}
fi

fly -t aws-sdp set-pipeline -c concourse/ci.yml -p ${pipeline_name}  -v branch=${branch} -v tag=${tag} -v repo_name=${repo_name} -v env=dev

echo "Pipeline \"${pipeline_name}\" set successfully."
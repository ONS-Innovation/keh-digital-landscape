# repo_name=${1}

# if [[ $# -gt 1 ]]; then
#     branch=${2}
#     git rev-parse --verify ${branch}
#     if [[ $? -ne 0 ]]; then
#         echo "Branch \"${branch}\" does not exist"
#         exit 1
#     fi
# else
#     branch=$(git rev-parse --abbrev-ref HEAD)
# fi

# if [[ ${branch} == "main" || ${branch} == "master" || ${branch} == "concourse" ]]; then
#     env="prod"
# else
#     env="dev"
# fi

# if [[ ${env} == "dev" ]]; then
#     tag=$(git rev-parse HEAD)
# else
#     tag=$(git tag | tail -n 1)
# fi

# fly -t aws-sdp set-pipeline -c concourse/ci.yml -p ${repo_name}-${branch} -v branch=${branch} -v tag=${tag} -v env=${env} --var repo_name=${repo_name}

#!/bin/bash
set -eo pipefail
# Usage: ./set_pipeline.sh
# repo_name=$(basename -s .git "$(git config --get remote.origin.url)")
repo_name="digital-landscape"
# Always use the current branch
branch=$(git rev-parse --abbrev-ref HEAD)

# Check that the branch exists
git rev-parse --verify "${branch}" >/dev/null 2>&1
if [[ $? -ne 0 ]]; then
    echo "Branch \"${branch}\" does not exist, you cannot set a pipeline without a valid branch."
    exit 1
fi


if [[ ${branch} == "main" || ${branch} == "master" ]]; then
    tag=$(git tag | tail -n 1)
else
    # Remove non-alphanumeric characters and take the first 7 characters
    tag=$(echo "${branch}" | tr -cd '[:alnum:]' | cut -c1-7)
fi

fly -t aws-sdp set-pipeline -c concourse/ci.yml -p ${repo_name}-${branch}  -v branch=${branch} -v tag=${tag} -v env=${env} -v repo_name=${repo_name} -l concourse/pipeline-vars.yml
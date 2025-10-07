# repo_name=${1}
#!/bin/bash
set -eo pipefail
# Usage: ./set_pipeline.sh
# repo_name=$(basename -s .git "$(git config --get remote.origin.url)")
repo_name="digital-landscape"
# Always use the current branch
branch=$(git rev-parse --abbrev-ref HEAD)

if [[ -z "${branch}" ]]; then
    echo "Branch name is empty, you cannot set a pipeline without a valid branch."
    exit 1
fi

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

fly -t aws-sdp set-pipeline -c concourse/ci.yml -p ${repo_name}-${branch}  -v branch=${branch} -v tag=${tag} -v repo_name=${repo_name}
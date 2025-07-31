set -euo pipefail

export STORAGE_DRIVER=vfs
export PODMAN_SYSTEMD_UNIT=concourse-task

aws ecr get-login-password --region eu-west-2 | podman --storage-driver=vfs login --username AWS --password-stdin ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com

container_image_frontend=$(echo "$secrets" | jq -r .container_image_frontend)
container_image_backend=$(echo "$secrets" | jq -r .container_image_backend)

podman build -t ${container_image_frontend}:${tag} resource-repo/frontend
podman build -t ${container_image_backend}:${tag} resource-repo/backend

podman tag ${container_image_frontend}:${tag} ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com/${container_image_frontend}:${tag}
podman tag ${container_image_backend}:${tag} ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com/${container_image_backend}:${tag}

podman push ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com/${container_image_frontend}:${tag}
podman push ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com/${container_image_backend}:${tag}


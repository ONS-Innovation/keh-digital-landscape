set -euo pipefail

export STORAGE_DRIVER=vfs
export PODMAN_SYSTEMD_UNIT=concourse-task

aws ecr get-login-password --region eu-west-2 | podman login --username AWS --password-stdin ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com

if [ -z "${shared_ecr_folder:-}" ]; then
  support_mail=$(echo "$secrets" | jq -r .support_mail)
  if [ -z "$support_mail" ] || [ "$support_mail" = "null" ]; then
    echo "support_mail variable missing"
  fi
fi

container_image_frontend=$(echo "$secrets" | jq -r .container_image_frontend)
container_image_backend=$(echo "$secrets" | jq -r .container_image_backend)

# Build images in parallel
echo "Building images in parallel..."
podman build --build-arg VITE_SUPPORT_MAIL=${support_mail} -t ${container_image_frontend}:${tag} resource-repo/frontend &
pid1=$!
podman build -t ${container_image_backend}:${tag} resource-repo/backend &
pid2=$!
wait $pid1 $pid2

# Tag images
echo "Tagging images..."
if [ -z "${shared_ecr_folder:-}" ]; then
  podman tag ${container_image_frontend}:${tag} ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com/${container_image_frontend}:${tag}
  podman tag ${container_image_backend}:${tag} ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com/${container_image_backend}:${tag}
else
  podman tag ${container_image_frontend}:${tag} ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com/${shared_ecr_folder}/${container_image_frontend}:${tag}
  podman tag ${container_image_backend}:${tag} ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com/${shared_ecr_folder}/${container_image_backend}:${tag}
fi
# Push images in parallel
echo "Pushing images to AWS in parallel..."
if [ -z "${shared_ecr_folder:-}" ]; then
  podman push --compression-format=gzip ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com/${container_image_frontend}:${tag} &
  pid3=$!
  podman push --compression-format=gzip ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com/${container_image_backend}:${tag} &
  pid4=$!
  wait $pid3 $pid4
else
  podman push --compression-format=gzip ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com/${shared_ecr_folder}/${container_image_frontend}:${tag} &
  pid5=$!
  podman push --compression-format=gzip ${aws_account_id}.dkr.ecr.eu-west-2.amazonaws.com/${shared_ecr_folder}/${container_image_backend}:${tag} &
  pid6=$!
  wait $pid5 $pid6
fi
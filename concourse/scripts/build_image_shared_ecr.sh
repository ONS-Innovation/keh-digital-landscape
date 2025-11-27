set -euo pipefail

#This script is to push the images to the shared ECR repo

export STORAGE_DRIVER=vfs
export PODMAN_SYSTEMD_UNIT=concourse-task

#Shared ECR login details
SHARED_ECR_ACCOUNT_ID=763104351884 #placeholder ID
SHARED_REGISTRY="${SHARED_ECR_ACCOUNT_ID}.dkr.ecr.eu-west-2.amazonaws.com"

#login to shared ECR
aws ecr get-login-password --region eu-west-2 | podman --storage-driver=vfs login --username AWS --password-stdin ${SHARED_REGISTRY}


support_mail=$(echo "$secrets" | jq -r .support_mail)
if [ -z "$support_mail" ] || [ "$support_mail" = "null" ]; then
  echo "support_mail variable missing"
fi

# Get container image names from secrets
container_image_frontend=$(echo "$secrets" | jq -r .container_image_frontend)
container_image_backend=$(echo "$secrets" | jq -r .container_image_backend)

#Build images in parallel
echo "Building images in parallel..."
podman build --build-arg VITE_SUPPORT_MAIL=${support_mail} -t ${container_image_frontend}:${tag} resource-repo/frontend &
pid1=$!
podman build -t ${container_image_backend}:${tag} resource-repo/backend &
pid2=$!
wait $pid1 $pid2

#Tag images for shared ECR
echo "Tagging images for shared ECR..."
podman tag ${container_image_frontend}:${tag} ${SHARED_REGISTRY}/${container_image_frontend}:${tag}
podman tag ${container_image_backend}:${tag} ${SHARED_REGISTRY}/${container_image_backend}:${tag}

#Push images to shared ECR in parallel
echo "Pushing images to shared AWS ECR in parallel..."
podman push ${SHARED_REGISTRY}/${container_image_frontend}:${tag} &
pid3=$!
podman push ${SHARED_REGISTRY}/${container_image_backend}:${tag} &
pid4=$!
wait $pid3 $pid4
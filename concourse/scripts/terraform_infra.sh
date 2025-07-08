set -euo pipefail

apk add --no-cache jq

aws_account_id=$(echo "$secrets" | jq -r .aws_account_id)
aws_access_key_id=$(echo "$secrets" | jq -r .aws_access_key_id)

aws_secret_access_key=$(echo "$secrets" | jq -r .aws_secret_access_key)
github_app_id=$(echo "$secrets" | jq -r .github_app_id)

github_app_client_id=$(echo "$secrets" | jq -r .github_app_client_id)
github_app_client_secret=$(echo "$secrets" | jq -r .github_app_client_secret)

service_memory=$(echo "$secrets" | jq -r .service_memory)
service_cpu=$(echo "$secrets" | jq -r .service_cpu)

service_subdomain=$(echo "$secrets" | jq -r .service_subdomain)
domain=$(echo "$secrets" | jq -r .domain)

aws_secret_name=$(echo "$secrets" | jq -r .aws_secret_name)
github_org=$(echo "$secrets" | jq -r .github_org)

s3_bucket_name=$(echo "$secrets" | jq -r .s3_bucket_name)
api_s3_bucket_name=$(echo "$secrets" | jq -r .api_s3_bucket_name)

container_image_frontend=$(echo "$secrets" | jq -r .container_image_frontend)
container_image_backend=$(echo "$secrets" | jq -r .container_image_backend)

export AWS_ACCESS_KEY_ID=$aws_access_key_id
export AWS_SECRET_ACCESS_KEY=$aws_secret_access_key

git config --global url."https://x-access-token:$github_access_token@github.com/".insteadOf "https://github.com/"

if [[ ${env} != "prod" ]]; then
    env="dev"
fi

echo ${env}

cd resource-repo/terraform/dashboard

terraform init -backend-config=env/${env}/backend-${env}.tfbackend -reconfigure

terraform apply \
-var "aws_account_id=$aws_account_id" \
-var "aws_access_key_id=$aws_access_key_id" \
-var "aws_secret_access_key=$aws_secret_access_key" \
-var "domain=$domain" \
-var "service_subdomain=${service_subdomain}" \
-var "github_app_id=$github_app_id" \
-var "github_app_client_id=$github_app_client_id" \
-var "github_app_client_secret=$github_app_client_secret" \
-var "aws_secret_name=$aws_secret_name" \
-var "github_org=$github_org" \
-var "service_memory=${service_memory}" \
-var "service_cpu=${service_cpu}" \
-var "s3_bucket_name=${s3_bucket_name}" \
-var "api_s3_bucket_name=${api_s3_bucket_name}" \
-var "container_ver=${tag}" \
-var "container_ver_backend=${tag}"
-auto-approve

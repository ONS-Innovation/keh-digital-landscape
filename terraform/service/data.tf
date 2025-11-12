# Get the ecs infrastructure outputs from the remote state data source
data "terraform_remote_state" "ecs_infrastructure" {
  backend = "s3"
  config = {
    bucket = "${var.domain}-tf-state"
    key    = "${var.domain}-ecs-infra/terraform.tfstate"
    region = "eu-west-2"
  }
}

data "terraform_remote_state" "ecs_auth" {
  backend = "s3"
  config = {
    bucket = "${var.domain}-tf-state"
    key    = "${var.domain}-ecs-${var.service_subdomain}-auth/terraform.tfstate"
    region = "eu-west-2"
  }
}

data "terraform_remote_state" "ecs_admin_auth" {
  backend = "s3"
  config = {
    bucket = "${var.domain}-tf-state"
    key    = "${var.domain}-ecs-${var.service_subdomain}-admin-auth/terraform.tfstate"
    region = "eu-west-2"
  }
}

data "aws_route53_zone" "route53_domain" {
  name = local.url
}

# Resolve the pushed backend image
data "aws_ecr_image" "backend_image" {
  repository_name = var.backend_ecr_repo
  image_tag       = var.container_ver_backend
}

# Resolve the pushed frontend image
data "aws_ecr_image" "frontend_image" {
  repository_name = var.frontend_ecr_repo
  image_tag       = var.container_ver
}

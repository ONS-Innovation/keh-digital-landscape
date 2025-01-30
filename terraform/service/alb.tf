# Update the Application Load Balancer to forward appropriate requests
# to the backend service running in ECS Fargate.
# Create target group, used by ALB to forward requests to ECS service
resource "aws_lb_target_group" "frontend_tg" {
  name        = "${var.service_subdomain}-frontend-tg"
  port        = var.frontend_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = data.terraform_remote_state.ecs_infrastructure.outputs.vpc_id

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 10
    interval            = 30
    timeout             = 5
    matcher             = "200-399"
  }
}

# Backend target group
resource "aws_lb_target_group" "backend_tg" {
  name        = "${var.service_subdomain}-backend-tg"
  port        = var.backend_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = data.terraform_remote_state.ecs_infrastructure.outputs.vpc_id

  health_check {
    path                = "/api/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 60
    timeout             = 30
    matcher             = "200"
  }

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }

  deregistration_delay = 60
}

resource "aws_lb_target_group" "frontend_new_tg" {
  name        = "${var.service_subdomain}-front-farg-tg"
  port        = var.frontend_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = data.terraform_remote_state.ecs_infrastructure.outputs.vpc_id

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 10
    interval            = 30
    timeout             = 5
    matcher             = "200-399"
  }
}

# Backend target group
resource "aws_lb_target_group" "backend_new_tg" {
  name        = "${var.service_subdomain}-back-farg-tg"
  port        = var.backend_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = data.terraform_remote_state.ecs_infrastructure.outputs.vpc_id

  health_check {
    path                = "/api/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 60
    timeout             = 30
    matcher             = "200"
  }

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }

  deregistration_delay = 60
}

# Use the module to get highest current priority
module "alb_listener_priority" {
  source                = "git::https://github.com/ONS-Innovation/keh-alb-listener-tf-module.git?ref=v1.0.0"
  aws_access_key_id     = var.aws_access_key_id
  aws_secret_access_key = var.aws_secret_access_key
  region                = var.region
  listener_arn          = data.terraform_remote_state.ecs_infrastructure.outputs.application_lb_https_listener_arn
}

# Deny access to review paths for github audit pool users (highest priority)
resource "aws_lb_listener_rule" "deny_review_paths" {
  listener_arn = data.terraform_remote_state.ecs_infrastructure.outputs.application_lb_https_listener_arn
  priority     = module.alb_listener_priority.highest_priority + 1

  condition {
    host_header {
      values = ["${local.service_url}"]
    }
  }

  condition {
    path_pattern {
      values = ["/review/*"]
    }
  }

  condition {
    http_header {
      http_header_name = "X-Amzn-Oidc-Identity"
      values = [data.terraform_remote_state.ecs_auth.outputs.cognito_user_pool_id]
    }
  }

  action {
    type = "fixed-response"

    fixed_response {
      content_type = "application/json"
      message_body = jsonencode({
        error   = "Access Denied"
        message = "This path requires reviewer authentication"
      })
      status_code = "403"
    }
  }
}

# Review frontend paths - restricted to reviewer pool only (second priority)
resource "aws_lb_listener_rule" "tech_radar_reviewer_frontend_rule" {
  listener_arn = data.terraform_remote_state.ecs_infrastructure.outputs.application_lb_https_listener_arn
  priority     = module.alb_listener_priority.highest_priority + 2

  condition {
    host_header {
      values = ["${local.service_url}"]
    }
  }

  condition {
    path_pattern {
      values = ["/review/dashboard"]
    }
  }

  action {
    type = "authenticate-cognito"

    authenticate_cognito {
      user_pool_arn       = data.terraform_remote_state.ecs_auth.outputs.cognito_reviewer_user_pool_arn
      user_pool_client_id = data.terraform_remote_state.ecs_auth.outputs.cognito_reviewer_user_pool_client_id
      user_pool_domain    = data.terraform_remote_state.ecs_auth.outputs.cognito_reviewer_user_pool_domain
      on_unauthenticated_request = "authenticate"
      session_timeout            = 3600
      session_cookie_name       = "ReviewerSession"
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_new_tg.arn
  }
}

# Review backend paths - restricted to reviewer pool only (third priority)
resource "aws_lb_listener_rule" "tech_radar_reviewer_backend_rule" {
  listener_arn = data.terraform_remote_state.ecs_infrastructure.outputs.application_lb_https_listener_arn
  priority     = module.alb_listener_priority.highest_priority + 4

  condition {
    host_header {
      values = ["${local.service_url}"]
    }
  }

  condition {
    path_pattern {
      values = ["/review/api/*"]
    }
  }

  action {
    type = "authenticate-cognito"

    authenticate_cognito {
      user_pool_arn       = data.terraform_remote_state.ecs_auth.outputs.cognito_reviewer_user_pool_arn
      user_pool_client_id = data.terraform_remote_state.ecs_auth.outputs.cognito_reviewer_user_pool_client_id
      user_pool_domain    = data.terraform_remote_state.ecs_auth.outputs.cognito_reviewer_user_pool_domain
      on_unauthenticated_request = "authenticate"
      session_timeout            = 3600
      session_cookie_name       = "ReviewerSession"
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_new_tg.arn
  }
}

# General API access for github audit pool (fourth priority)
resource "aws_lb_listener_rule" "digital_landscape_cognito_api_rule" {
  listener_arn = data.terraform_remote_state.ecs_infrastructure.outputs.application_lb_https_listener_arn
  priority     = module.alb_listener_priority.highest_priority + 6

  condition {
    host_header {
      values = ["${local.service_url}"]
    }
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }

  action {
    type = "authenticate-cognito"

    authenticate_cognito {
      user_pool_arn       = data.terraform_remote_state.ecs_auth.outputs.cognito_user_pool_arn
      user_pool_client_id = data.terraform_remote_state.ecs_auth.outputs.cognito_user_pool_client_id
      user_pool_domain    = data.terraform_remote_state.ecs_auth.outputs.cognito_user_pool_domain
      on_unauthenticated_request = "authenticate"
      session_timeout            = 3600
      session_cookie_name       = "AuditSession"
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_new_tg.arn
  }
}

# General frontend access for github audit pool (lowest priority)
resource "aws_lb_listener_rule" "digital_landscape_cognito_frontend_rule" {
  listener_arn = data.terraform_remote_state.ecs_infrastructure.outputs.application_lb_https_listener_arn
  priority     = module.alb_listener_priority.highest_priority + 7

  condition {
    host_header {
      values = ["${local.service_url}"]
    }
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }

  action {
    type = "authenticate-cognito"

    authenticate_cognito {
      user_pool_arn       = data.terraform_remote_state.ecs_auth.outputs.cognito_user_pool_arn
      user_pool_client_id = data.terraform_remote_state.ecs_auth.outputs.cognito_user_pool_client_id
      user_pool_domain    = data.terraform_remote_state.ecs_auth.outputs.cognito_user_pool_domain
      on_unauthenticated_request = "authenticate"
      session_timeout            = 3600
      session_cookie_name       = "AuditSession"
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_new_tg.arn
  }
}

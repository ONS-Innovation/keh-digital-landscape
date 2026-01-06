variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "aws_access_key_id" {
  description = "AWS Access Key ID"
  type        = string
}

variable "aws_secret_access_key" {
  description = "AWS Secret Access Key"
  type        = string
}

variable "service_subdomain" {
  description = "Service subdomain"
  type        = string
  default     = "digital-landscape"
}

variable "service_title" {
  description = "Service name used in auth emails"
  type        = string
  default     = "ONS Digital Landscape"
}

variable "domain" {
  description = "Domain"
  type        = string
  default     = "sdp-dev"
}
variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2"
}

variable "project_tag" {
  description = "Project"
  type        = string
  default     = "SDP"
}

variable "team_owner_tag" {
  description = "Team Owner"
  type        = string
  default     = "Knowledge Exchange Hub"
}

variable "business_owner_tag" {
  description = "Business Owner"
  type        = string
  default     = "DST"
}

variable "domain_extension" {
  description = "Domain extension"
  type        = string
  default     = "aws.onsdigital.uk"
}


variable "user_groups" {
  description = "Map of user groups to create in the user pool, where key is group name and value is description"
  type        = map(string)
  default = {
    "admin"    = "The admin users for the Digital Landscape"
    "reviewer" = "The reviewer users for the Digital Landscape"
  }
}

variable "token_validity_values" {
  description = "Token validity duration values"
  type = object({
    refresh_token = number
    access_token  = number
    id_token      = number
  })
  default = {
    refresh_token = 30 # 30 days
    access_token  = 3  # 3 hours
    id_token      = 3  # 3 hours

  }
}

variable "sign_out_urls" {
  description = "List of allowed sign out URLs for the identity providers"
  type        = list(string)
  default     = []
}

locals {
  url         = "${var.domain}.${var.domain_extension}"
  service_url = "${var.service_subdomain}.${local.url}"
}

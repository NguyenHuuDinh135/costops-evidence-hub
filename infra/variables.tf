variable "aws_region" {
  description = "AWS region for workload resources."
  type        = string
  default     = "ap-southeast-1"
}

variable "app_name" {
  description = "Application name used for resource naming and Application tag."
  type        = string
  default     = "CostOpsEvidenceHub"
}

variable "environment" {
  description = "Environment tag."
  type        = string
  default     = "dev"
}

variable "cost_center" {
  description = "CostCenter tag, e.g. personal group ID G7."
  type        = string
}

variable "owner_email" {
  description = "Owner tag and AWS Budget subscriber email."
  type        = string
}

variable "github_owner" {
  description = "GitHub username or org that owns the repository."
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name."
  type        = string
  default     = "costops-evidence-hub"
}

variable "api_zip_path" {
  description = "Path to built API Lambda zip. CI builds this before terraform apply."
  type        = string
  default     = "../apps/api/dist/api.zip"
}

variable "cost_guard_zip_path" {
  description = "Path to built Cost Guard Lambda zip."
  type        = string
  default     = "../apps/api/dist/cost-guard.zip"
}

variable "security_guard_zip_path" {
  description = "Path to built Security Guard Lambda zip."
  type        = string
  default     = "../apps/api/dist/security-guard.zip"
}

variable "budget_limit_usd" {
  description = "Daily hard budget alert target for W6."
  type        = number
  default     = 150
}

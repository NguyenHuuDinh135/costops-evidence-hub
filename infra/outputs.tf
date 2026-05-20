output "github_actions_role_arn" {
  description = "Store this as GitHub repo variable AWS_ROLE_ARN for CI/CD OIDC."
  value       = aws_iam_role.github_actions.arn
}

output "frontend_bucket" {
  value = aws_s3_bucket.frontend.bucket
}

output "frontend_website_endpoint" {
  value = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "frontend_website_url" {
  value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}

output "api_base_url" {
  value = aws_apigatewayv2_api.http.api_endpoint
}

output "api_lambda_name" {
  value = aws_lambda_function.api.function_name
}

output "budget_sns_topic_arn" {
  value = aws_sns_topic.budget_alerts.arn
}

output "cost_guard_lambda_name" {
  value = aws_lambda_function.cost_guard.function_name
}

output "security_guard_lambda_name" {
  value = aws_lambda_function.security_guard.function_name
}

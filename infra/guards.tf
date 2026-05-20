resource "aws_cloudwatch_log_group" "cost_guard" {
  name              = "/aws/lambda/${local.name_prefix}-cost-guard"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "security_guard" {
  name              = "/aws/lambda/${local.name_prefix}-security-guard"
  retention_in_days = 14
}

resource "aws_lambda_function" "cost_guard" {
  function_name    = "${local.name_prefix}-cost-guard"
  role             = aws_iam_role.cost_guard.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  filename         = var.cost_guard_zip_path
  source_code_hash = filebase64sha256(var.cost_guard_zip_path)
  timeout          = 30
  memory_size      = 256

  depends_on = [aws_cloudwatch_log_group.cost_guard]
}

resource "aws_lambda_function" "security_guard" {
  function_name    = "${local.name_prefix}-security-guard"
  role             = aws_iam_role.security_guard.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  filename         = var.security_guard_zip_path
  source_code_hash = filebase64sha256(var.security_guard_zip_path)
  timeout          = 30
  memory_size      = 256

  depends_on = [aws_cloudwatch_log_group.security_guard]
}

resource "aws_cloudwatch_event_rule" "cost_guard_daily" {
  name                = "${local.name_prefix}-cost-guard-daily"
  description         = "Daily MH-COST-A guard: stop running EC2 instances without keep=true"
  schedule_expression = "cron(0 11 * * ? *)"
}

resource "aws_cloudwatch_event_target" "cost_guard_daily" {
  rule = aws_cloudwatch_event_rule.cost_guard_daily.name
  arn  = aws_lambda_function.cost_guard.arn
}

resource "aws_lambda_permission" "allow_events_cost_guard" {
  statement_id  = "AllowEventBridgeCostGuard"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cost_guard.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cost_guard_daily.arn
}

resource "aws_cloudwatch_event_rule" "security_guard_hourly" {
  name                = "${local.name_prefix}-security-guard-hourly"
  description         = "MH-SEC guard: remove world-open SSH/RDP security group ingress"
  schedule_expression = "rate(1 hour)"
}

resource "aws_cloudwatch_event_target" "security_guard_hourly" {
  rule = aws_cloudwatch_event_rule.security_guard_hourly.name
  arn  = aws_lambda_function.security_guard.arn
}

resource "aws_lambda_permission" "allow_events_security_guard" {
  statement_id  = "AllowEventBridgeSecurityGuard"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.security_guard.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.security_guard_hourly.arn
}

resource "aws_sns_topic" "budget_alerts" {
  name = "${local.name_prefix}-budget-alerts"
}

resource "aws_sns_topic_subscription" "budget_to_cost_guard" {
  topic_arn = aws_sns_topic.budget_alerts.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.cost_guard.arn
}

resource "aws_lambda_permission" "allow_sns_cost_guard" {
  statement_id  = "AllowBudgetSnsCostGuard"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cost_guard.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.budget_alerts.arn
}

resource "aws_budgets_budget" "daily" {
  name         = "${var.cost_center}-daily-cap-${var.budget_limit_usd}"
  budget_type  = "COST"
  limit_amount = tostring(var.budget_limit_usd)
  limit_unit   = "USD"
  time_unit    = "DAILY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.owner_email]
    subscriber_sns_topic_arns  = [aws_sns_topic.budget_alerts.arn]
  }

}

resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "${local.name_prefix}-api-5xx"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "5xx"
  namespace           = "AWS/ApiGateway"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  treat_missing_data  = "notBreaching"
  alarm_description   = "API Gateway 5xx errors should be zero during the lab demo."

  dimensions = { ApiId = aws_apigatewayv2_api.http.id }
}

resource "aws_cloudwatch_dashboard" "ops" {
  dashboard_name = "${local.name_prefix}-ops"
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "API requests"
          region  = var.aws_region
          metrics = [["AWS/ApiGateway", "Count", "ApiId", aws_apigatewayv2_api.http.id]]
          stat    = "Sum"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "Lambda duration"
          region  = var.aws_region
          metrics = [["AWS/Lambda", "Duration", "FunctionName", aws_lambda_function.api.function_name]]
          stat    = "Average"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "CWAgent memory placeholder"
          region  = var.aws_region
          metrics = [["CWAgent", "mem_used_percent", "Application", var.app_name]]
          stat    = "Average"
          period  = 300
        }
      }
    ]
  })
}

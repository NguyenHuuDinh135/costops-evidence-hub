# CostOps Evidence Hub

Monorepo cá nhân cho Lab W6-1/W6 operational hardening:

- Frontend: TanStack Start + shadcn/ui monorepo preset `b0`, RTL + pointer enabled.
- UI package: `bunx --bun shadcn@latest add --all -c packages/ui` đã cài toàn bộ core components.
- shadcn Registry Directory: đã kiểm tra registry bằng `shadcn search @shadcn` và block `@shadcn/dashboard-01`; frontend hiện dùng các registry components cần thiết (`card`, `badge`, `button`, `tabs`, `chart`, `progress`, `separator`, `alert`) thay vì tự viết component từ đầu.
- Backend: Hono API chạy local bằng Bun và deploy Lambda qua API Gateway.
- Infra local: Terraform chạy trên máy local để tạo S3 Static Website, API Lambda, Cost Guard Lambda, Security Guard Lambda, AWS Budget/SNS, CloudWatch dashboard/alarm, GitHub OIDC role. App này không dùng CloudFront theo scope hiện tại.
- CI/CD GitHub: GitHub Actions dùng OIDC để build/publish app code lên hạ tầng đã tạo bởi Terraform; workflow không chạy `terraform apply`.

## Local dev

```bash
bun install
bun run dev
# API riêng nếu cần:
bun --cwd apps/api run dev
```

## Bootstrap AWS + GitHub OIDC lần đầu

1. Tạo GitHub repo rỗng, ví dụ `costops-evidence-hub`.
2. Copy tfvars:

```bash
cp infra/terraform.tfvars.example infra/terraform.tfvars
```

3. Sửa `owner_email`, `cost_center`, `github_owner`, `github_repo` trong `infra/terraform.tfvars`.
4. Build Lambda zips và apply Terraform bằng AWS CLI credentials local của bạn:

```bash
bun install
bun run build
terraform -chdir=infra init
terraform -chdir=infra apply
```

5. Lưu các Terraform outputs cần cho GitHub CI/CD vào repo variables. Không lưu AWS access key dài hạn:

```bash
gh variable set AWS_ROLE_ARN --body "$(terraform -chdir=infra output -raw github_actions_role_arn)"
gh variable set FRONTEND_BUCKET --body "$(terraform -chdir=infra output -raw frontend_bucket)"
gh variable set FRONTEND_WEBSITE_URL --body "$(terraform -chdir=infra output -raw frontend_website_url)"
gh variable set API_BASE_URL --body "$(terraform -chdir=infra output -raw api_base_url)"
gh variable set API_LAMBDA_NAME --body "$(terraform -chdir=infra output -raw api_lambda_name)"
gh variable set COST_GUARD_LAMBDA_NAME --body "$(terraform -chdir=infra output -raw cost_guard_lambda_name)"
gh variable set SECURITY_GUARD_LAMBDA_NAME --body "$(terraform -chdir=infra output -raw security_guard_lambda_name)"
```

6. Push repo lên GitHub. Từ lần sau workflow `deploy` chỉ build/publish code lên hạ tầng đã tạo local bằng Terraform.

> Nếu account đã có GitHub OIDC provider, Terraform có thể báo trùng provider. Khi đó import provider hiện có vào state hoặc đổi sang data source theo policy lớp học.

## Lab 1 focus

Lab 1 (MH-COST-V) dùng project này để chứng minh:

- Tagging strategy 4 keys: `Owner`, `Environment`, `CostCenter`, `Application`.
- Tags được apply trên billable resources.
- User-defined cost allocation tags được activate trong Billing console.
- Cost Explorer view filter theo `Application=CostOpsEvidenceHub` hoặc `CostCenter=<G...>`.
- AWS Budget daily $150 + email/SNS alert.

## W6 extension readiness

Project đã chuẩn bị sẵn skeleton cho:

- MH-COST-A: `apps/api/src/cost-guard.ts` dừng EC2 running không có `keep=true`.
- MH-OBS: CloudWatch dashboard/alarm Terraform.
- MH-SEC: `apps/api/src/security-guard.ts` revoke SG mở SSH/RDP và có S3 Block Public Access.
- Evidence Pack: xem `docs/W6_evidence.md`.

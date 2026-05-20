# Tagging Strategy — Personal Lab

## Required tag keys

| Key | Example value | Rule |
|---|---|---|
| Owner | you@example.com | One accountable person. Lowercase email. |
| Environment | dev | Must be `dev`, `staging`, or `prod`; never mix `Dev` and `dev`. |
| CostCenter | G7 | Personal/group ID for billing attribution. |
| Application | CostOpsEvidenceHub | PascalCase application/workload name. |

## Enforcement plan

- Terraform `default_tags` applies the four keys to supported AWS resources.
- Production create permissions should require `aws:RequestTag/Owner`, `aws:RequestTag/CostCenter`, and `aws:RequestTag/Application`.
- Cost Guard Lambda stops billable compute that lacks `keep=true`.
- Evidence screenshots are stored in `docs/W6_evidence.md`.

## Why Owner and CostCenter are different

`CostCenter` answers who pays for the workload. `Owner` answers who gets paged when the workload is unsafe, expensive, or broken at 02:00.

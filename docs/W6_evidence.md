# W6 Evidence Pack — CostOps Evidence Hub

## Cover

- Student/group: TODO
- Repo link: TODO
- Commit hash: TODO
- AWS region: ap-southeast-1
- Application: CostOpsEvidenceHub
- Cost cap: <= USD $150

## Project Recap

CostOps Evidence Hub is a small serverless operations portal for tracking cost attribution, budget guardrails, observability, and self-healing security controls. It uses a static shadcn/TanStack frontend, a Lambda-backed API, and Terraform-managed AWS infrastructure.

## MH-COST-V — Cost Visibility & Attribution

- [ ] Tagging strategy exists: `docs/tagging-strategy.md`
- [ ] Resources have `Owner`, `Environment`, `CostCenter`, `Application`
- [ ] Billing console → Cost allocation tags → 4 keys Active
- [ ] Cost Explorer saved report filtered by tag
- [ ] AWS Budget daily $150 created
- [ ] Baseline top-3 cost drivers written below

Baseline note:

> TODO: after ~24h, capture Cost Explorer screenshot and write 1–2 lines on top-3 drivers.

## MH-COST-A — Cost Control & Action

- [ ] EventBridge schedule invokes Cost Guard Lambda
- [ ] Lambda role only has EC2 describe/stop + logs permissions
- [ ] Test EC2 without `keep=true` was stopped
- [ ] CloudTrail `StopInstances` event captured
- [ ] AWS Budgets → SNS → Cost Guard Lambda tested with SNS publish
- [ ] Latency ADR written below

Latency ADR:

> AWS cost data can lag 8–24h. The scheduled guard is the immediate control; Budgets is a delayed cost signal path.

## MH-OBS — CloudWatch Observability

- [ ] CloudWatch dashboard exists
- [ ] API metric widget exists
- [ ] Data/storage metric widget exists
- [ ] CWAgent memory metric widget placeholder replaced with real metric after agent setup
- [ ] At least one alarm is OK
- [ ] Log Insights query saved and screenshot captured

## MH-SEC — Self-Healing Security Guard

- [ ] Security Guard Lambda deployed
- [ ] EventBridge trigger configured
- [ ] Demo violation created: SG open to `0.0.0.0/0` on 22 or 3389
- [ ] Lambda revoked the risky ingress rule
- [ ] Before/after screenshot captured
- [ ] CloudTrail `RevokeSecurityGroupIngress` event captured
- [ ] Preventive control: S3 Block Public Access + deny insecure transport bucket policy

Security-cost statement:

> TODO: write 1–2 sentences explaining why this low-cost security control fits a $150 workshop cap.

## Bonus / Optimization Actions

- [ ] Trusted Advisor config-based findings remediated
- [ ] gp2→gp3 migration documented
- [ ] RI/Savings Plan break-even or deferral written
- [ ] 100–150 word wasteful → changed reflection

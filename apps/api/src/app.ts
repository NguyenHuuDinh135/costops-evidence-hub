import { Hono } from "hono"
import { z } from "zod"

const TagSchema = z.object({
  Owner: z.string().email(),
  Environment: z.enum(["dev", "staging", "prod"]),
  CostCenter: z.string().min(2),
  Application: z.string().min(2),
})

const sampleCost = [
  { service: "Lambda", amount: 0.21, trend: "flat" },
  { service: "S3", amount: 0.08, trend: "flat" },
  { service: "API Gateway", amount: 0.04, trend: "flat" },
]

export const app = new Hono()

app.get("/health", (c) =>
  c.json({ ok: true, service: "costops-api", checkedAt: new Date().toISOString() })
)

app.get("/cost/baseline", (c) =>
  c.json({
    application: process.env.APP_NAME ?? "CostOpsEvidenceHub",
    currency: "USD",
    period: "daily",
    total: sampleCost.reduce((sum, item) => sum + item.amount, 0),
    drivers: sampleCost,
    note: "Demo baseline. Replace with Cost Explorer GetCostAndUsage after tags are active for ~24h.",
  })
)

app.get("/tags/strategy", (c) =>
  c.json({
    requiredKeys: ["Owner", "Environment", "CostCenter", "Application"],
    rule: "Tag at creation time, then activate user-defined cost allocation tags in Billing console.",
    enforcement: [
      "IAM aws:RequestTag conditions for production creates",
      "EventBridge + Lambda guard for remediation",
      "Evidence screenshots in docs/W6_evidence.md",
    ],
  })
)

app.post("/tags/validate", async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = TagSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ ok: false, issues: parsed.error.flatten().fieldErrors }, 400)
  }
  return c.json({ ok: true, tags: parsed.data })
})

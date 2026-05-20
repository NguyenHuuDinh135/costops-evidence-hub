import { readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = join(here, "..", ".output", "public")
const assetsDir = join(publicDir, "assets")
const assets = readdirSync(assetsDir)
const css = assets.find((file) => file.startsWith("globals-") && file.endsWith(".css"))
const cssLink = css ? `<link rel="stylesheet" href="/assets/${css}" />` : ""

const html = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CostOps Evidence Hub</title>
    ${cssLink}
    <style>
      body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #020617; color: #e2e8f0; }
      .page { min-height: 100vh; padding: 48px 24px; background: radial-gradient(circle at top left, rgba(14, 165, 233, .22), transparent 32rem), radial-gradient(circle at bottom right, rgba(34, 197, 94, .18), transparent 30rem), #020617; }
      .wrap { max-width: 1120px; margin: 0 auto; }
      .eyebrow { color: #38bdf8; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; font-size: 12px; }
      h1 { font-size: clamp(40px, 7vw, 88px); line-height: .95; margin: 16px 0; letter-spacing: -.06em; }
      .lead { max-width: 760px; color: #94a3b8; font-size: 20px; line-height: 1.7; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; margin-top: 32px; }
      .card { border: 1px solid rgba(148, 163, 184, .24); border-radius: 24px; padding: 24px; background: rgba(15, 23, 42, .72); box-shadow: 0 24px 90px rgba(2, 6, 23, .42); }
      .card h2 { font-size: 18px; margin: 0 0 10px; }
      .card p, li { color: #94a3b8; line-height: 1.6; }
      .badge { display: inline-flex; border: 1px solid rgba(56, 189, 248, .35); color: #7dd3fc; border-radius: 999px; padding: 6px 10px; font-size: 12px; margin-bottom: 14px; background: rgba(8, 47, 73, .35); }
      .flow { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 28px; }
      .node { border: 1px solid rgba(34, 197, 94, .35); border-radius: 16px; padding: 14px 16px; background: rgba(6, 78, 59, .26); color: #bbf7d0; font-weight: 700; }
      .arrow { color: #64748b; font-weight: 900; }
      a { color: #7dd3fc; }
      code { color: #bae6fd; }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="wrap">
        <div class="eyebrow">Lab 1 · Cost Visibility & Attribution</div>
        <h1>CostOps Evidence Hub</h1>
        <p class="lead">Portal trình bày lab AWS CostOps: frontend S3 Static Website, backend Hono Lambda, Terraform chạy local, GitHub Actions deploy code bằng OIDC, không dùng CloudFront.</p>
        <div class="flow"><div class="node">Browser</div><div class="arrow">→</div><div class="node">S3 Website</div><div class="arrow">→</div><div class="node">API Gateway</div><div class="arrow">→</div><div class="node">Lambda API</div><div class="arrow">→</div><div class="node">CloudWatch</div></div>
        <div class="grid">
          <article class="card"><span class="badge">MH-COST-V</span><h2>Cost Visibility</h2><p>Tagging strategy gồm Owner, Environment, CostCenter, Application; dùng Billing Cost Allocation Tags, Budget và evidence checklist.</p></article>
          <article class="card"><span class="badge">MH-COST-A</span><h2>Cost Guard</h2><p>Lambda chạy daily để stop EC2 instance không có tag <code>keep=true</code>, giúp giảm chi phí lab ngoài ý muốn.</p></article>
          <article class="card"><span class="badge">MH-SEC</span><h2>Security Guard</h2><p>Lambda hourly tìm security group mở SSH/RDP ra 0.0.0.0/0 và revoke ingress rule nguy hiểm.</p></article>
          <article class="card"><span class="badge">CI/CD</span><h2>GitHub OIDC</h2><p>Terraform provision infra local; GitHub Actions chỉ upload static assets và update Lambda code qua IAM role OIDC.</p></article>
        </div>
        <div class="grid">
          <article class="card"><h2>Backend endpoints</h2><ul><li><code>GET /health</code></li><li><code>GET /cost/baseline</code></li><li><code>GET /tags/strategy</code></li><li><code>POST /tags/validate</code></li></ul></article>
          <article class="card"><h2>Evidence</h2><p>Xem repo docs: <code>docs/W6_evidence.md</code>, <code>docs/tagging-strategy.md</code>, <code>docs/architecture-sketch.html</code>.</p></article>
        </div>
      </section>
    </main>
  </body>
</html>
`

writeFileSync(join(publicDir, "index.html"), html)
console.log("Wrote static S3 website index.html")

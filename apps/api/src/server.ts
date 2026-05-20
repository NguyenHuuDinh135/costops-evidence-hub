import { serve } from "bun"
import { app } from "./app"

serve({
  port: Number(process.env.PORT ?? 8787),
  fetch: app.fetch,
})

console.log("CostOps API listening on http://localhost:8787")

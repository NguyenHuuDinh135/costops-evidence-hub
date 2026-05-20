import { createFileRoute } from "@tanstack/react-router"
import {
  Activity,
  AlertTriangle,
  BadgeDollarSign,
  CheckCircle2,
  Cloud,
  GitBranch,
  LockKeyhole,
  Tags,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts"

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"
import { Progress } from "@workspace/ui/components/progress"
import { Separator } from "@workspace/ui/components/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import type { ChartConfig } from "@workspace/ui/components/chart"

export const Route = createFileRoute("/")({ component: App })

const costData = [
  { day: "Mon", lambda: 0.08, s3: 0.02, api: 0.01 },
  { day: "Tue", lambda: 0.11, s3: 0.03, api: 0.02 },
  { day: "Wed", lambda: 0.18, s3: 0.04, api: 0.03 },
  { day: "Thu", lambda: 0.16, s3: 0.05, api: 0.04 },
  { day: "Fri", lambda: 0.21, s3: 0.08, api: 0.04 },
]

const evidence = [
  { name: "MH-COST-V", status: "Ready", detail: "Tag strategy + cost allocation activation + budget baseline" },
  { name: "MH-COST-A", status: "Infra", detail: "EventBridge + Cost Guard Lambda + Budgets SNS path" },
  { name: "MH-OBS", status: "Infra", detail: "CloudWatch dashboard, alarms, API/data metrics" },
  { name: "MH-SEC", status: "Infra", detail: "Security Guard Lambda + preventive S3/KMS controls" },
]

const chartConfig = {
  lambda: { label: "Lambda", color: "var(--chart-1)" },
  s3: { label: "S3", color: "var(--chart-2)" },
  api: { label: "API Gateway", color: "var(--chart-3)" },
} satisfies ChartConfig

function App() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <BadgeDollarSign className="size-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lab W6-1 · Cost Visibility</p>
                <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">CostOps Evidence Hub</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="rounded-full">Terraform</Badge>
              <Badge variant="secondary" className="rounded-full">GitHub OIDC</Badge>
              <Badge variant="secondary" className="rounded-full">AWS Serverless</Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {evidence.map((item) => (
              <Card key={item.name}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    {item.name}
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  </CardTitle>
                  <CardDescription>{item.detail}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>{item.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.35fr_.65fr] lg:px-8">
        <Tabs defaultValue="cost" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cost">Cost</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="ops">Ops</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="cost" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily cost baseline by service</CardTitle>
                <CardDescription>Demo dataset để trình bày flow. Sau khi activate tags ~24h, thay bằng Cost Explorer API.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80 w-full">
                  <AreaChart data={costData} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area dataKey="lambda" type="monotone" fill="var(--color-lambda)" fillOpacity={0.35} stroke="var(--color-lambda)" />
                    <Area dataKey="s3" type="monotone" fill="var(--color-s3)" fillOpacity={0.25} stroke="var(--color-s3)" />
                    <Area dataKey="api" type="monotone" fill="var(--color-api)" fillOpacity={0.2} stroke="var(--color-api)" />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Required cost allocation tags</CardTitle>
                <CardDescription>Tag tồn tại trên resource chưa đủ; phải activate trong Billing console.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {["Owner", "Environment", "CostCenter", "Application"].map((tag) => (
                  <div key={tag} className="rounded-xl border p-4">
                    <div className="mb-2 flex items-center gap-2 font-medium"><Tags className="size-4" />{tag}</div>
                    <p className="text-sm text-muted-foreground">Áp khi tạo resource và đưa vào screenshot evidence.</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ops" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Operational guardrails</CardTitle>
                <CardDescription>Những phần dùng cho W6 deploy/evidence.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <Guardrail icon={<Cloud />} title="GitHub Actions → AWS OIDC" text="Không dùng long-lived AWS keys. Terraform output role ARN để lưu vào repo variable." />
                <Guardrail icon={<Activity />} title="Cost Guard Lambda" text="Scheduled EventBridge dừng EC2 running không có keep=true, least privilege IAM." />
                <Guardrail icon={<AlertTriangle />} title="Budget SNS path" text="AWS Budgets daily $150 publish SNS → Cost Guard Lambda để demo trigger path." />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Self-healing security guard</CardTitle>
                <CardDescription>Pattern giống cost guard nhưng sửa security misconfiguration.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ issues: { label: "Issues", color: "var(--chart-4)" } }} className="h-72 w-full">
                  <BarChart data={[{ stage: "Before", issues: 2 }, { stage: "After", issues: 0 }]} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="stage" tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="issues" fill="var(--color-issues)" radius={8} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Readiness</CardTitle>
              <CardDescription>Checklist trước khi push GitHub.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Readiness label="shadcn/ui components" value={100} />
              <Readiness label="Terraform skeleton" value={90} />
              <Readiness label="Evidence templates" value={80} />
              <Readiness label="AWS account values" value={40} />
            </CardContent>
          </Card>

          <Alert>
            <LockKeyhole className="size-4" />
            <AlertTitle>Security default</AlertTitle>
            <AlertDescription>
              Infra ưu tiên serverless, encrypted buckets, S3 Block Public Access và OIDC thay vì AWS access keys.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Next action</CardTitle>
              <CardDescription>Chốt đề tài rồi tạo GitHub repo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full"><GitBranch className="mr-2 size-4" />Push to GitHub</Button>
              <Separator />
              <p className="text-sm text-muted-foreground">Đề xuất mặc định: CostOps Evidence Hub — portal cá nhân để chứng minh MH-COST-V/A/OBS/SEC.</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  )
}

function Guardrail({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

function Readiness({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  )
}

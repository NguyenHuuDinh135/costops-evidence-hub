import {
  DescribeInstancesCommand,
  EC2Client,
  StopInstancesCommand,
} from "@aws-sdk/client-ec2"

const ec2 = new EC2Client({})

function hasKeepTrue(tags: Array<{ Key?: string; Value?: string }> = []) {
  return tags.some((tag) => tag.Key === "keep" && tag.Value?.toLowerCase() === "true")
}

export async function handler(event: unknown) {
  console.log("cost-guard event", JSON.stringify(event))

  const response = await ec2.send(
    new DescribeInstancesCommand({
      Filters: [{ Name: "instance-state-name", Values: ["running"] }],
    })
  )

  const candidates =
    response.Reservations?.flatMap((reservation) => reservation.Instances ?? [])
      .filter((instance) => instance.InstanceId && !hasKeepTrue(instance.Tags))
      .map((instance) => instance.InstanceId!) ?? []

  if (candidates.length > 0) {
    await ec2.send(new StopInstancesCommand({ InstanceIds: candidates }))
  }

  return {
    stoppedCount: candidates.length,
    stoppedInstanceIds: candidates,
    rule: "Stop running EC2 instances that do not have keep=true",
  }
}

import {
  AuthorizeSecurityGroupIngressCommand,
  DescribeSecurityGroupsCommand,
  EC2Client,
  RevokeSecurityGroupIngressCommand,
} from "@aws-sdk/client-ec2"
import { PutPublicAccessBlockCommand, S3Client } from "@aws-sdk/client-s3"

const ec2 = new EC2Client({})
const s3 = new S3Client({})

async function remediateOpenSshOrRdp() {
  const groups = await ec2.send(
    new DescribeSecurityGroupsCommand({
      Filters: [{ Name: "ip-permission.cidr", Values: ["0.0.0.0/0"] }],
    })
  )

  const remediated: Array<string> = []

  for (const group of groups.SecurityGroups ?? []) {
    const risky = (group.IpPermissions ?? []).filter((permission) => {
      const from = permission.FromPort
      const to = permission.ToPort
      const openWorld = permission.IpRanges?.some((range) => range.CidrIp === "0.0.0.0/0")
      const riskyPort = from !== undefined && to !== undefined && [22, 3389].some((port) => from <= port && port <= to)
      return openWorld && riskyPort
    })

    if (group.GroupId && risky.length > 0) {
      await ec2.send(
        new RevokeSecurityGroupIngressCommand({
          GroupId: group.GroupId,
          IpPermissions: risky,
        })
      )
      remediated.push(group.GroupId)
    }
  }

  return remediated
}

async function protectBucket(bucketName?: string) {
  if (!bucketName) return null
  await s3.send(
    new PutPublicAccessBlockCommand({
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        IgnorePublicAcls: true,
        BlockPublicPolicy: true,
        RestrictPublicBuckets: true,
      },
    })
  )
  return bucketName
}

export async function handler(event: { bucketName?: string; demoOpenSgId?: string } = {}) {
  console.log("security-guard event", JSON.stringify(event))

  if (event.demoOpenSgId) {
    await ec2.send(
      new AuthorizeSecurityGroupIngressCommand({
        GroupId: event.demoOpenSgId,
        IpProtocol: "tcp",
        FromPort: 22,
        ToPort: 22,
        CidrIp: "0.0.0.0/0",
      })
    ).catch((error) => console.warn("demo ingress may already exist", error?.name))
  }

  const securityGroups = await remediateOpenSshOrRdp()
  const bucket = await protectBucket(event.bucketName)

  return {
    remediatedSecurityGroups: securityGroups,
    protectedBucket: bucket,
    rule: "Revoke world-open SSH/RDP and optionally enforce S3 Block Public Access",
  }
}

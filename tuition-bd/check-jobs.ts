import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const jobs = await prisma.tuitionJob.findMany({ select: { id: true, title: true, jobSeq: true } })
  console.log(jobs)
}
main().catch(console.error).finally(() => prisma.$disconnect())

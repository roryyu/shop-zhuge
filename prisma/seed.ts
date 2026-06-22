import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg(connectionString, { schema: "shopzhuge" })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = "admin@admin.com"
  const password = "admin123"
  const name = "管理员"

  // 检查是否已存在
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    console.log(`用户 ${email} 已存在，更新密码和角色...`)
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: "ADMIN",
        name,
      },
    })
    console.log(`用户 ${email} 已更新`)
  } else {
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
    })
    console.log(`用户 ${email} 创建成功`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

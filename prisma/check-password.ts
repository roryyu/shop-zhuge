import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg(connectionString, { schema: "shopzhuge" })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = "admin@admin.com"
  const testPassword = "admin123"

  // 获取用户
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, password: true },
  })

  if (!user) {
    console.log("用户不存在")
    return
  }

  console.log("用户信息:", {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  // 验证密码
  const isValid = await bcrypt.compare(testPassword, user.password)
  console.log("密码验证结果:", isValid)

  // 重新哈希密码并更新
  if (!isValid) {
    console.log("重新设置密码...")
    const newHashedPassword = await bcrypt.hash(testPassword, 10)
    await prisma.user.update({
      where: { email },
      data: { password: newHashedPassword },
    })
    console.log("密码已更新")

    // 再次验证
    const newUser = await prisma.user.findUnique({ where: { email } })
    if (newUser) {
      const newIsValid = await bcrypt.compare(testPassword, newUser.password)
      console.log("新密码验证结果:", newIsValid)
    }
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

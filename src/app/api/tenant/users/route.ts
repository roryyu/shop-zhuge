import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

// 获取当前租户的用户列表
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== "TENANTADMIN") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 })
    }

    // 获取当前用户的tenantId
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    if (!currentUser?.tenantId) {
      return NextResponse.json({ error: "用户不属于任何租户" }, { status: 400 })
    }

    const users = await prisma.user.findMany({
      where: { tenantId: currentUser.tenantId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("获取用户列表失败:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

// 创建租户用户
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== "TENANTADMIN") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 })
    }

    // 获取当前用户的tenantId
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    if (!currentUser?.tenantId) {
      return NextResponse.json({ error: "用户不属于任何租户" }, { status: 400 })
    }

    const { email, password, name, phone, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码为必填项" },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被使用" },
        { status: 400 }
      )
    }

    // 检查手机号是否已存在（如果提供了）
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      })

      if (existingPhone) {
        return NextResponse.json(
          { error: "该手机号已被使用" },
          { status: 400 }
        )
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        phone: phone || null,
        role: role || "USER",
        tenantId: currentUser.tenantId,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("创建用户失败:", error)
    return NextResponse.json({ error: "创建失败" }, { status: 500 })
  }
}

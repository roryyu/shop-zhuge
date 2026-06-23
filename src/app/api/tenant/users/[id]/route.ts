import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

// 获取单个用户
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const user = await prisma.user.findUnique({
      where: { 
        id: params.id,
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

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("获取用户失败:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

// 更新用户
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // 验证要更新的用户属于当前租户
    const targetUser = await prisma.user.findUnique({
      where: { 
        id: params.id,
        tenantId: currentUser.tenantId,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    const { email, password, name, phone, role } = await request.json()

    // 检查邮箱是否已被其他用户使用
    if (email && email !== targetUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "该邮箱已被使用" },
          { status: 400 }
        )
      }
    }

    // 检查手机号是否已被其他用户使用
    if (phone && phone !== targetUser.phone) {
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

    const updateData: any = {
      email: email || undefined,
      name: name !== undefined ? name : null,
      phone: phone !== undefined ? phone : null,
      role: role || undefined,
    }

    // 如果提供了密码，加密后更新
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(user)
  } catch (error) {
    console.error("更新用户失败:", error)
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}

// 删除用户
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // 验证要删除的用户属于当前租户
    const targetUser = await prisma.user.findUnique({
      where: { 
        id: params.id,
        tenantId: currentUser.tenantId,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 不允许删除自己
    if (params.id === session.user.id) {
      return NextResponse.json({ error: "不能删除自己" }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("删除用户失败:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}

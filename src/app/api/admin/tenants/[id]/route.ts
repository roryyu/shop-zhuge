import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = Promise<{ id: string }>

// 获取单个租户详情
export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 })
    }

    const { id } = await params

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: "租户不存在" }, { status: 404 })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error("获取租户详情失败:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

// 更新租户
export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 })
    }

    const { id } = await params
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "租户名称为必填项" }, { status: 400 })
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: { name },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(tenant)
  } catch (error) {
    console.error("更新租户失败:", error)
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}

// 删除租户
export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 })
    }

    const { id } = await params

    // 检查租户是否存在
    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
    })

    if (!existingTenant) {
      return NextResponse.json({ error: "租户不存在" }, { status: 404 })
    }

    // 使用事务删除用户和租户
    await prisma.$transaction(async (tx) => {
      // 先删除租户下的所有用户
      await tx.user.deleteMany({
        where: { tenantId: id },
      })
      // 再删除租户
      await tx.tenant.delete({
        where: { id },
      })
    })

    return NextResponse.json({ message: "删除成功" })
  } catch (error) {
    console.error("删除租户失败:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

// 获取租户列表
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 })
    }

    const tenants = await prisma.tenant.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        modulePermissions: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(tenants)
  } catch (error) {
    console.error("获取租户列表失败:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

// 创建租户（同时创建租户管理员）
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 })
    }

    const { name, adminEmail, adminPassword, adminName, modulePermissions } = await request.json()

    if (!name || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "租户名称、管理员邮箱和密码为必填项" },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被使用" },
        { status: 400 }
      )
    }

    // 1. 创建租户
    const tenant = await prisma.tenant.create({
      data: { name },
    })

    // 2. 加密密码
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // 3. 创建租户管理员
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName || "租户管理员",
        role: "TENANTADMIN",
        tenantId: tenant.id,
      },
    })

    // 4. 创建租户模块权限
    const permissions = await prisma.tenantModulePermission.create({
      data: {
        tenantId: tenant.id,
        storeOpeningConsultation: modulePermissions?.storeOpeningConsultation ?? true,
        categorySelectionAdvice: modulePermissions?.categorySelectionAdvice ?? true,
        locationScreening: modulePermissions?.locationScreening ?? true,
        brandPositioningAdvice: modulePermissions?.brandPositioningAdvice ?? true,
        licenseAndLaunchChecklist: modulePermissions?.licenseAndLaunchChecklist ?? true,
        storeOpeningProcessSOP: modulePermissions?.storeOpeningProcessSOP ?? true,
        priceSuggestion: modulePermissions?.priceSuggestion ?? true,
        groupPurchasePackageDesign: modulePermissions?.groupPurchasePackageDesign ?? true,
        marketingAdvice: modulePermissions?.marketingAdvice ?? true,
      },
    })

    const result = { tenant, adminUser, modulePermissions: permissions }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("创建租户失败:", error)
    return NextResponse.json({ error: "创建失败" }, { status: 500 })
  }
}

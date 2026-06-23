import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// 模块选项列表（英文值 -> 中文名称）
export const MODULE_OPTIONS: Record<string, string> = {
  storeOpeningConsultation: "开店咨询",
  categorySelectionAdvice: "品类选择建议",
  locationScreening: "商圈筛选",
  brandPositioningAdvice: "品牌定位建议",
  licenseAndLaunchChecklist: "证照/上线办理清单",
  storeOpeningProcessSOP: "店铺流程/SOP/筹备清单",
  priceSuggestion: "定价建议",
  groupPurchasePackageDesign: "团购套餐设计",
  onlineChecklist: "上线检查清单",
  marketingAdvice: "营销建议",
}

// 获取所有提示词配置
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 })
    }

    const settings = await prisma.openingDecisionSetting.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("获取提示词配置失败:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

// 创建或更新提示词配置（每个 module 只有一条）
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 })
    }

    const { module, prompt, info } = await request.json()

    if (!module || !prompt) {
      return NextResponse.json(
        { error: "模块和提示词为必填项" },
        { status: 400 }
      )
    }

    if (!Object.keys(MODULE_OPTIONS).includes(module)) {
      return NextResponse.json(
        { error: "无效的模块类型" },
        { status: 400 }
      )
    }

    // 使用 upsert：存在则更新，不存在则创建
    const setting = await prisma.openingDecisionSetting.upsert({
      where: { module },
      update: { prompt, info },
      create: { module, prompt, info },
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error("保存提示词配置失败:", error)
    return NextResponse.json({ error: "保存失败" }, { status: 500 })
  }
}

// 删除提示词配置
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "ID 为必填项" },
        { status: 400 }
      )
    }

    await prisma.openingDecisionSetting.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("删除提示词配置失败:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}


import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { chatWithLogging, getDefaultModel } from "@/lib/ai"

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

// 获取当前用户的历史记录和所有模块设置
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 并行获取历史记录和模块设置
    const [records, settings] = await Promise.all([
      prisma.openingDecisionRecord.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.openingDecisionSetting.findMany(),
    ])

    return NextResponse.json({
      records,
      settings,
    })
  } catch (error) {
    console.error("获取计划数据失败:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

/**
 * 上下文压缩：将历史对话总结为新的系统提示词
 * @param modulePrompt 模块原始 prompt
 * @param lastUserPrompt 最新的用户问题
 * @param lastAssistantResponse 最新的 AI 回答
 * @param moduleName 模块名称
 * @returns 压缩后的系统提示词
 */
async function compressContext(
  modulePrompt: string,
  lastUserPrompt: string,
  lastAssistantResponse: string,
  moduleName: string
): Promise<string> {
  const compressPrompt = `请对以下对话内容进行专业的总结分析，提取关键信息，形成简洁的上下文摘要。
这个摘要将作为后续对话的系统提示词使用，请确保信息完整但精炼。

【模块名称】${moduleName}
【原始系统提示】${modulePrompt}
【用户问题】${lastUserPrompt}
【AI 回答】${lastAssistantResponse}

请输出总结后的上下文摘要，突出关键信息和核心结论，不超过300字。`

  const completion = await chatWithLogging(
    {
      model: getDefaultModel(),
      messages: [{ role: "user", content: compressPrompt }],
      temperature: 0.3,
    },
    {
      module: "上下文压缩",
    }
  )

  return completion.choices[0]?.message?.content || modulePrompt
}

// 发送消息并获取 AI 回复（支持追问的上下文压缩）
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { module, userPrompt } = await request.json()

    if (!module || !userPrompt) {
      return NextResponse.json(
        { error: "模块和用户输入为必填项" },
        { status: 400 }
      )
    }

    if (!Object.keys(MODULE_OPTIONS).includes(module)) {
      return NextResponse.json(
        { error: "无效的模块类型" },
        { status: 400 }
      )
    }

    // 获取该模块的 prompt 设置
    const setting = await prisma.openingDecisionSetting.findUnique({
      where: { module },
    })

    const baseSystemPrompt = setting?.prompt || `你是一个本地生活店铺经营资深专家，请为用户提供专业的${MODULE_OPTIONS[module]}建议。`
    const moduleName = MODULE_OPTIONS[module] || module

    // 查询该模块下用户最新的一条历史记录
    const lastRecord = await prisma.openingDecisionRecord.findFirst({
      where: {
        userId: session.user.id,
        module: module,
      },
      orderBy: { createdAt: "desc" },
    })

    let finalSystemPrompt = baseSystemPrompt

    // 如果有历史记录，进行上下文压缩
    if (lastRecord && lastRecord.userPrompt && lastRecord.assistantResponse) {
      try {
        const compressedContext = await compressContext(
          baseSystemPrompt,
          lastRecord.userPrompt,
          lastRecord.assistantResponse,
          moduleName
        )
        // 将压缩后的上下文与原始系统提示词结合
        finalSystemPrompt = `【角色设定】${baseSystemPrompt}

【历史上下文摘要】${compressedContext}

请基于以上历史上下文和角色设定，回答用户的新问题。`
      } catch (error) {
        console.error("上下文压缩失败，使用原始提示词:", error)
        // 压缩失败时，回退到原始提示词
      }
    }

    // 调用 AI 获取回答
    const completion = await chatWithLogging(
      {
        model: getDefaultModel(),
        messages: [
          { role: "system", content: finalSystemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      },
      {
        module: moduleName,
        userId: session.user.id,
        userName: session.user.name || undefined,
      }
    )

    const assistantResponse = completion.choices[0]?.message?.content || ""

    // 保存新记录到数据库
    const record = await prisma.openingDecisionRecord.create({
      data: {
        userId: session.user.id,
        module,
        userPrompt,
        assistantResponse,
      },
    })

    return NextResponse.json({
      id: record.id,
      module,
      userPrompt,
      assistantResponse,
      createdAt: record.createdAt,
    })
  } catch (error) {
    console.error("发送消息失败:", error)
    return NextResponse.json({ error: "发送失败，请稍后重试" }, { status: 500 })
  }
}

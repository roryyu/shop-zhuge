import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { streamChatWithLogging, getDefaultModel } from "@/lib/ai"
import { MODULE_OPTIONS } from "../route"

/**
 * 上下文压缩：将历史对话总结为新的系统提示词
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

  let fullResponse = ""
  const stream = streamChatWithLogging(
    {
      model: getDefaultModel(),
      messages: [{ role: "user", content: compressPrompt }],
      temperature: 0.3,
    },
    {
      module: "上下文压缩",
    }
  )

  for await (const chunk of stream) {
    fullResponse += chunk
  }

  return fullResponse || modulePrompt
}

// 发送消息并获取流式 AI 回复（支持追问的上下文压缩）
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

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let fullResponse = ""
        let recordId: string | null = null

        try {
          // 调用流式 AI 接口
          const chatStream = streamChatWithLogging(
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

          // 逐块发送响应
          for await (const chunk of chatStream) {
            fullResponse += chunk
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          }

          // 流式输出完成后，保存到数据库
          const record = await prisma.openingDecisionRecord.create({
            data: {
              userId: session.user.id,
              module,
              userPrompt,
              assistantResponse: fullResponse,
            },
          })
          recordId = record.id

          // 发送最终记录 ID，让前端刷新历史
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ recordId: record.id })}\n\n`))

          // 发送结束标记
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        } catch (error) {
          console.error("流式响应错误:", error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "流式响应失败" })}\n\n`))
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error) {
    console.error("发送消息失败:", error)
    return NextResponse.json({ error: "发送失败，请稍后重试" }, { status: 500 })
  }
}

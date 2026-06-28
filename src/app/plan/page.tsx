"use client"

import "./markdown.css"
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Send,
  Loader2,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  Bot,
  Clock,
  Calendar,
  Plus,
  Sparkles,
  ArrowLeft,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// 模块选项列表（英文值 -> 中文名称）
const MODULE_OPTIONS: Record<string, string> = {
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

interface OpeningDecisionSetting {
  id: string
  module: string
  prompt: string | null
  info: string | null
  createdAt: string
  updatedAt: string
}

interface OpeningDecisionRecord {
  id: string
  userId: string
  module: string | null
  userPrompt: string | null
  assistantResponse: string | null
  createdAt: string
  updatedAt: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  module?: string
  createdAt: Date
  isStreaming?: boolean
}

export default function PlanPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [records, setRecords] = useState<OpeningDecisionRecord[]>([])
  const [settings, setSettings] = useState<OpeningDecisionSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // 切换模块展开状态
  const toggleModule = (module: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(module)) {
        next.delete(module)
      } else {
        next.add(module)
      }
      return next
    })
  }

  // 获取当前模块的 info 提示
  const getCurrentModuleInfo = (module: string) => {
    if (!module) return ""
    const setting = settings.find((s) => s.module === module)
    return setting?.info || ""
  }

  // 获取数据
  const fetchData = async () => {
    try {
      const res = await fetch("/api/plan")
      if (!res.ok) throw new Error("获取失败")
      const data = await res.json()
      setRecords(data.records || [])
      setSettings(data.settings || [])
    } catch (error) {
      console.error("获取数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  // 初始化
  useEffect(() => {
    if (status === "authenticated") {
      fetchData()
    }
  }, [status])

  // 检查权限
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // 按模块分组历史记录
  const groupedRecords = records.reduce((acc, record) => {
    const module = record.module || "未分类"
    if (!acc[module]) {
      acc[module] = []
    }
    acc[module].push(record)
    return acc
  }, {} as Record<string, OpeningDecisionRecord[]>)

  // 过滤搜索结果
  const filteredRecords = (records: OpeningDecisionRecord[]) => {
    if (!searchQuery) return records
    return records.filter(
      (r) =>
        r.userPrompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.assistantResponse?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // 获取当前选中模块下的所有记录（按时间升序）
  const currentModuleRecords = selectedModule
    ? records
        .filter((r) => r.module === selectedModule)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : []

  // 合并历史记录和本地临时消息（流式显示用）
  const displayMessages: Message[] = selectedModule
    ? [
        ...currentModuleRecords.map((r) => ({
          id: r.id,
          role: "user" as const,
          content: r.userPrompt || "",
          module: r.module || undefined,
          createdAt: new Date(r.createdAt),
          isStreaming: false,
        })),
        ...currentModuleRecords.map((r) => ({
          id: r.id + "-assistant",
          role: "assistant" as const,
          content: r.assistantResponse || "",
          module: r.module || undefined,
          createdAt: new Date(r.createdAt),
          isStreaming: false,
        })),
        ...localMessages.filter((m) => m.module === selectedModule),
      ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    : []

  // 发送消息
  const handleSend = async () => {
    if (!selectedModule || !inputValue.trim() || submitting) return

    const userMessage = inputValue.trim()
    setInputValue("")
    setSubmitting(true)

    // 生成临时 ID
    const tempId = Date.now().toString()

    // 1. 先将用户消息添加到本地显示
    const userTempMessage: Message = {
      id: tempId,
      role: "user",
      content: userMessage,
      module: selectedModule,
      createdAt: new Date(),
      isStreaming: false,
    }
    setLocalMessages((prev) => [...prev, userTempMessage])
    setTimeout(scrollToBottom, 100)

    // 2. 添加 AI 正在回复的占位消息
    const assistantTempMessage: Message = {
      id: tempId + "-assistant",
      role: "assistant",
      content: "",
      module: selectedModule,
      createdAt: new Date(),
      isStreaming: true,
    }
    setLocalMessages((prev) => [...prev, assistantTempMessage])
    setTimeout(scrollToBottom, 100)

    try {
      // 3. 调用流式 API
      const res = await fetch("/api/plan/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: selectedModule,
          userPrompt: userMessage,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "发送失败")
      }

      // 4. 读取流式响应
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  fullResponse += parsed.content
                  // 更新本地 AI 消息内容
                  setLocalMessages((prev) =>
                    prev.map((m) =>
                      m.id === tempId + "-assistant"
                        ? { ...m, content: fullResponse }
                        : m
                    )
                  )
                  setTimeout(scrollToBottom, 50)
                } else if (parsed.recordId) {
                  // 收到最终记录 ID，刷新历史记录
                  const newRecordId = parsed.recordId
                  // 从本地移除临时消息
                  setLocalMessages((prev) =>
                    prev.filter((m) => m.id !== tempId && m.id !== tempId + "-assistant")
                  )
                  // 刷新历史记录
                  fetchData()
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }
    } catch (error: any) {
      alert(error.message || "发送失败，请稍后重试")
      // 出错时移除临时消息
      setLocalMessages((prev) =>
        prev.filter((m) => m.id !== tempId && m.id !== tempId + "-assistant")
      )
    } finally {
      setSubmitting(false)
    }
  }

  // 开始新对话
  const handleNewChat = () => {
    setSelectedModule("")
    setInputValue("")
  }

  // 点击左侧模块标题 - 显示该模块所有聊天记录，输入框保持空
  const handleClickModule = (module: string) => {
    setSelectedModule(module)
    setInputValue("") // 保持为空
  }

  // 底部专家选择器选择 - 填充 info
  const handleSelectExpert = (module: string) => {
    setSelectedModule(module)
    const info = getCurrentModuleInfo(module)
    setInputValue(info) // 填充 info
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "今天"
    if (days === 1) return "昨天"
    if (days < 7) return `${days}天前`
    if (days < 30) return `${Math.floor(days / 7)}周前`
    if (days < 365) return `${Math.floor(days / 30)}月前`
    return date.toLocaleDateString("zh-CN")
  }

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff385c]" />
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#f7f7f7]">
      {/* 顶部返回栏 */}
      <div className="h-12 border-b border-[#ebebeb] flex items-center px-4 bg-white flex-shrink-0">
        <a
          href="/dashboard"
          className="flex items-center gap-2 text-[#6a6a6a] hover:text-[#222222] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">返回</span>
        </a>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧边栏 - 历史记录 */}
        <div className="w-80 bg-white border-r border-[#ebebeb] flex flex-col flex-shrink-0">
          {/* 顶部标题和搜索 */}
          <div className="p-4 border-b border-[#ebebeb]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">历史对话</h2>
              <Button variant="ghost" size="icon" onClick={handleNewChat} title="新对话">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索对话..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c]"
            />
          </div>
        </div>

        {/* 历史记录列表 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : Object.keys(groupedRecords).length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">暂无历史对话</p>
              <p className="text-gray-400 text-xs mt-1">开始您的第一个咨询吧</p>
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedRecords).map(([module, moduleRecords]) => {
                const filtered = filteredRecords(moduleRecords)
                if (filtered.length === 0) return null

                return (
                  <div key={module} className="mb-2">
                    {/* 模块分组标题 - 点击显示该模块所有聊天记录 */}
                    <button
                      onClick={() => handleClickModule(module)}
                      className={`w-full px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                        selectedModule === module
                          ? "bg-[#fff1f3] text-[#ff385c]"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {expandedModules.has(module) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="truncate">
                        {MODULE_OPTIONS[module as keyof typeof MODULE_OPTIONS] || module}
                      </span>
                    </button>

                    {/* 记录列表预览 */}
                    {false && (
                      <div className="ml-4">
                        {filtered.slice(0, 3).map((record) => (
                          <div
                            key={record.id}
                            className="px-4 py-2"
                          >
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {record.userPrompt || "无内容"}
                            </p>
                          </div>
                        ))}
                        {filtered.length > 3 && (
                          <div className="px-4 py-1 text-xs text-gray-400">
                            还有 {filtered.length - 3} 条...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 右侧对话区域 */}
      <div className="flex-1 flex flex-col">
        {/* 消息展示区域 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {selectedModule && displayMessages.length > 0 ? (
            // 显示该模块下的所有聊天记录
            <div className="max-w-4xl mx-auto space-y-6">
              {displayMessages.map((message) => (
                <div key={message.id} className="space-y-6">
                  {message.role === "user" ? (
                    /* 用户消息 */
                    <div className="flex gap-4 justify-end">
                      <div className="max-w-[70%] bg-[#ff385c] text-white px-5 py-3 rounded-2xl rounded-br-md shadow-sm">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  ) : (
                    /* AI 回复 */
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#ebebeb] flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-[#ff385c]" />
                      </div>
                      <div className="max-w-[70%] bg-white border border-[#ebebeb] px-5 py-4 rounded-2xl rounded-tl-md shadow-sm">
                        <div className="prose prose-sm max-w-none prose-table:border-collapse prose-table:w-full prose-th:border prose-th:px-3 prose-th:py-2 prose-th:bg-gray-50 prose-th:text-left prose-td:border prose-td:px-3 prose-td:py-2 markdown-content">
                          {message.content ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                            >
                              {message.content}
                            </ReactMarkdown>
                          ) : message.isStreaming ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-400">正在思考</span>
                              <span className="flex gap-0.5">
                                <span className="w-1.5 h-1.5 bg-[#ff385c] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 bg-[#ff385c] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 bg-[#ff385c] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                              </span>
                            </div>
                          ) : null}
                        </div>
                        {!message.isStreaming && (
                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>{message.createdAt.toLocaleString("zh-CN")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : selectedModule ? (
            // 新对话模式 - 显示空状态
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff385c] to-[#ff5e84] flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {MODULE_OPTIONS[selectedModule as keyof typeof MODULE_OPTIONS]}
                </h3>
                <p className="text-gray-500 text-sm max-w-md">
                  输入您的问题，AI 将为您提供专业建议
                </p>
              </div>
            </div>
          ) : (
            // 未选择模块
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff385c] to-[#ff5e84] flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">开店决策助手</h3>
                <p className="text-gray-500 text-sm max-w-md">
                  选择下方的专家模块，输入您的问题，AI 将为您提供专业的开店决策建议
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 底部输入区域 */}
        <div className="bg-white border-t border-[#ebebeb] px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {/* 输入框 */}
            <div className="flex gap-3 items-end mb-3">
              <div className="flex-1 relative">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={selectedModule ? "请输入您的问题..." : "请先选择专家模块"}
                  disabled={!selectedModule || submitting}
                  className="min-h-[80px] resize-none pr-12"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!selectedModule || !inputValue.trim() || submitting}
                className="h-12 w-12 p-0"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* 专家选择按钮 */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Select
                  value={selectedModule}
                  onChange={(e) => handleSelectExpert(e.target.value)}
                  className="w-40 h-9 text-xs bg-[#fff1f3] text-[#ff385c] border-[#ffc9d2] hover:bg-[#ffd9df] transition-colors rounded-md font-medium"
                >
                  <option value="">专家选择</option>
                  {Object.entries(MODULE_OPTIONS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              {selectedModule && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-[#fff1f3] text-[#ff385c] rounded-full text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  <span>{MODULE_OPTIONS[selectedModule as keyof typeof MODULE_OPTIONS]}</span>
                </div>
              )}
              <p className="ml-auto text-xs text-gray-400">
                内容由 AI 生成，请仔细甄别
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

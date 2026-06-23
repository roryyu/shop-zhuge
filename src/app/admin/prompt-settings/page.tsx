"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, X, Loader2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

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

interface PromptSetting {
  id: string
  module: string
  prompt: string | null
  info: string | null
  createdAt: string
  updatedAt: string
}

export default function PromptSettingsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [settings, setSettings] = useState<PromptSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSetting, setEditingSetting] = useState<PromptSetting | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    module: "",
    prompt: "",
    info: "",
  })

  // 切换展开状态
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // 检查权限
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.push("/")
    }
  }, [session, status, router])

  // 获取提示词配置列表
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/prompt-settings")
      if (!res.ok) throw new Error("获取失败")
      const data = await res.json()
      setSettings(data)
    } catch (error) {
      console.error("获取提示词配置列表失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchSettings()
    }
  }, [status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/admin/prompt-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "保存失败")
      }

      await fetchSettings()
      handleCloseModal()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除该提示词配置吗？")) {
      return
    }

    try {
      const res = await fetch("/api/admin/prompt-settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error("删除失败")
      await fetchSettings()
    } catch (error) {
      console.error("删除失败:", error)
      alert("删除失败，请稍后重试")
    }
  }

  const handleOpenModal = (setting?: PromptSetting) => {
    if (setting) {
      setEditingSetting(setting)
      setFormData({
        module: setting.module,
        prompt: setting.prompt || "",
        info: setting.info || "",
      })
    } else {
      setEditingSetting(null)
      setFormData({
        module: "",
        prompt: "",
        info: "",
      })
    }
    setError("")
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingSetting(null)
    setError("")
  }

  // 获取已使用的模块
  const usedModules = new Set(settings.map((s) => s.module))
  // 获取可用模块（编辑时包含当前模块）
  const availableModules = Object.entries(MODULE_OPTIONS).filter(
    ([key]) => !usedModules.has(key) || (editingSetting && editingSetting.module === key)
  )

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-64px-64px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">提示词管理</h1>
          <p className="text-gray-600 mt-1">管理各模块的 AI 提示词配置</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          添加配置
        </Button>
      </div>

      {/* 配置列表 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : settings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无提示词配置</p>
          <p className="text-sm text-gray-400 mt-1">点击上方按钮添加第一个配置</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {settings.map((setting) => {
            const isExpanded = expandedIds.has(setting.id)
            return (
              <div
                key={setting.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {MODULE_OPTIONS[setting.module as keyof typeof MODULE_OPTIONS] || setting.module}
                      </span>
                      <span className="text-xs text-gray-400">
                        更新于 {new Date(setting.updatedAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                    {setting.info && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs font-medium text-blue-700 mb-1">用户提问提示：</p>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">{setting.info}</p>
                      </div>
                    )}
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">AI 提示词：</p>
                      <div
                        className={`text-gray-700 text-sm markdown-content ${
                          !isExpanded ? "line-clamp-3" : ""
                        }`}
                      >
                        <ReactMarkdown>{setting.prompt || ""}</ReactMarkdown>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(setting.id)}
                      className="mt-2 text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          收起 <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          展开查看全部 <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(setting)}
                      className="h-8 text-gray-600 hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(setting.id)}
                      className="h-8 text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingSetting ? "编辑提示词配置" : "添加提示词配置"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="module">模块</Label>
                <Select
                  id="module"
                  value={formData.module}
                  onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                  disabled={!!editingSetting || submitting}
                  required
                >
                  <option value="">请选择模块</option>
                  {availableModules.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
                {availableModules.length === 0 && !editingSetting && (
                  <p className="text-sm text-gray-500">所有模块都已配置完成</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">AI 提示词</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="请输入该模块的 AI 系统提示词..."
                  disabled={submitting}
                  required
                  className="min-h-[200px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="info">用户提问提示</Label>
                <Textarea
                  id="info"
                  value={formData.info}
                  onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                  placeholder="请输入给用户的提问提示信息，引导用户提供必要的信息..."
                  disabled={submitting}
                  className="min-h-[100px] resize-y"
                />
                <p className="text-xs text-gray-500">
                  该字段用于在前端显示给用户，指导用户如何提问。
                </p>
              </div>

              {/* 弹窗底部 */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    "保存"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

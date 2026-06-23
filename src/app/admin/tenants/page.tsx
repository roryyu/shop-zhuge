"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, X, Check, Building2, Users, Loader2 } from "lucide-react"

// 模块配置列表
const MODULE_LIST = [
  { key: "storeOpeningConsultation", label: "开店咨询" },
  { key: "categorySelectionAdvice", label: "品类选择建议" },
  { key: "locationScreening", label: "商圈筛选" },
  { key: "brandPositioningAdvice", label: "品牌定位建议" },
  { key: "licenseAndLaunchChecklist", label: "证照/上线办理清单" },
  { key: "storeOpeningProcessSOP", label: "店铺流程/SOP/筹备清单" },
  { key: "priceSuggestion", label: "定价建议" },
  { key: "groupPurchasePackageDesign", label: "团购套餐设计" },
  { key: "marketingAdvice", label: "营销建议" },
]

interface ModulePermissions {
  storeOpeningConsultation: boolean
  categorySelectionAdvice: boolean
  locationScreening: boolean
  brandPositioningAdvice: boolean
  licenseAndLaunchChecklist: boolean
  storeOpeningProcessSOP: boolean
  priceSuggestion: boolean
  groupPurchasePackageDesign: boolean
  marketingAdvice: boolean
}

interface Tenant {
  id: string
  name: string | null
  createdAt: string
  updatedAt: string
  users: Array<{
    id: string
    email: string
    name: string | null
    role: string
  }>
  modulePermissions?: ModulePermissions[]
}

export default function TenantsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    adminEmail: "",
    adminPassword: "",
    adminName: "",
    modulePermissions: {
      storeOpeningConsultation: true,
      categorySelectionAdvice: true,
      locationScreening: true,
      brandPositioningAdvice: true,
      licenseAndLaunchChecklist: true,
      storeOpeningProcessSOP: true,
      priceSuggestion: true,
      groupPurchasePackageDesign: true,
      marketingAdvice: true,
    },
  })

  // 检查权限
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.push("/")
    }
  }, [session, status, router])

  // 获取租户列表
  const fetchTenants = async () => {
    try {
      const res = await fetch("/api/admin/tenants")
      if (!res.ok) throw new Error("获取失败")
      const data = await res.json()
      setTenants(data)
    } catch (error) {
      console.error("获取租户列表失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchTenants()
    }
  }, [status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      if (editingTenant) {
        // 更新租户
        const res = await fetch(`/api/admin/tenants/${editingTenant.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name: formData.name,
            modulePermissions: formData.modulePermissions,
          }),
        })
        if (!res.ok) throw new Error("更新失败")
      } else {
        // 创建租户
        const res = await fetch("/api/admin/tenants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "创建失败")
        }
      }

      // 刷新列表
      await fetchTenants()
      handleCloseModal()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除该租户吗？此操作将同时删除该租户下的所有用户，且不可恢复。")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/tenants/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("删除失败")
      await fetchTenants()
    } catch (error) {
      console.error("删除失败:", error)
      alert("删除失败，请稍后重试")
    }
  }

  const handleOpenModal = (tenant?: Tenant) => {
    const defaultPermissions = {
      storeOpeningConsultation: true,
      categorySelectionAdvice: true,
      locationScreening: true,
      brandPositioningAdvice: true,
      licenseAndLaunchChecklist: true,
      storeOpeningProcessSOP: true,
      priceSuggestion: true,
      groupPurchasePackageDesign: true,
      marketingAdvice: true,
    }

    if (tenant) {
      const existingPermissions = tenant.modulePermissions?.[0] || defaultPermissions
      setEditingTenant(tenant)
      setFormData({
        name: tenant.name || "",
        adminEmail: "",
        adminPassword: "",
        adminName: "",
        modulePermissions: existingPermissions,
      })
    } else {
      setEditingTenant(null)
      setFormData({
        name: "",
        adminEmail: "",
        adminPassword: "",
        adminName: "",
        modulePermissions: defaultPermissions,
      })
    }
    setError("")
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTenant(null)
    setError("")
  }

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-64px-64px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-64px-64px)] bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">租户管理</h1>
            <p className="text-gray-600 mt-1">管理系统租户及租户管理员账号</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            新建租户
          </button>
        </div>

        {/* 租户列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tenants.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无租户</h3>
            <p className="text-gray-600">点击右上角按钮创建第一个租户</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tenant.name || "未命名租户"}</h3>
                      <p className="text-xs text-gray-500">
                        创建于 {new Date(tenant.createdAt).toLocaleDateString("zh-CN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(tenant)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tenant.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Users className="h-4 w-4" />
                    <span>管理员：</span>
                  </div>
                  {tenant.users.length === 0 ? (
                    <p className="text-sm text-gray-400 pl-6">暂无管理员</p>
                  ) : (
                    <div className="pl-6 space-y-1 mb-4">
                      {tenant.users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {user.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 模块权限概览 */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>已启用模块：</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pl-6">
                    {MODULE_LIST.map((module) => {
                      const isEnabled = tenant.modulePermissions?.[0]?.[module.key as keyof ModulePermissions] ?? true
                      return isEnabled ? (
                        <span
                          key={module.key}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full"
                        >
                          {module.label}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTenant ? "编辑租户" : "新建租户"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  租户名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="请输入租户名称"
                />
              </div>

              {!editingTenant && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      管理员邮箱 *
                    </label>
                    <input
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="请输入管理员邮箱"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      管理员密码 *
                    </label>
                    <input
                      type="password"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="至少6位密码"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      管理员姓名
                    </label>
                    <input
                      type="text"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="请输入管理员姓名（可选）"
                    />
                  </div>
                </>
              )}

              {/* 模块权限配置 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  功能模块权限
                </label>
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  {MODULE_LIST.map((module) => (
                    <label
                      key={module.key}
                      className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:border-primary/50 cursor-pointer"
                    >
                      <span className="text-sm text-gray-700">{module.label}</span>
                      <input
                        type="checkbox"
                        checked={formData.modulePermissions[module.key as keyof typeof formData.modulePermissions]}
                        onChange={(e) => setFormData({
                          ...formData,
                          modulePermissions: {
                            ...formData.modulePermissions,
                            [module.key]: e.target.checked,
                          },
                        })}
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingTenant ? "保存" : "创建"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

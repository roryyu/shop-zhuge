"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, Mail, Shield, Check, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session])

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff385c]" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "更新失败")
      }

      // 更新 session
      await update({ name })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-[#f7f7f7] to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#222222]">设置</h1>
          <p className="text-[#6a6a6a] mt-1">管理您的账户信息</p>
        </div>

        {/* 用户信息卡片 */}
        <div className="bg-white rounded-2xl border border-[#ebebeb] shadow-sm overflow-hidden">
          {/* 头部 */}
          <div className="p-6 border-b border-[#ebebeb]">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#ff385c] to-[#ff5e84] flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">
                  {(session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#222222]">
                  {session?.user?.name || "用户"}
                </h2>
                <p className="text-[#6a6a6a] text-sm">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          {/* 表单区域 */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 成功提示 */}
            {success && (
              <div className="flex items-center gap-2 p-4 bg-[#ecfdf5] text-[#059669] rounded-xl">
                <Check className="h-5 w-5" />
                <span className="font-medium">用户名更新成功！</span>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="p-4 bg-[#fef2f2] text-[#dc2626] rounded-xl">
                {error}
              </div>
            )}

            {/* 用户名字段 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#222222] mb-3">
                <User className="h-4 w-4 text-[#6a6a6a]" />
                用户名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-[#dddddd] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c] transition-all"
                placeholder="请输入用户名"
              />
            </div>

            {/* 邮箱字段（只读） */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#222222] mb-3">
                <Mail className="h-4 w-4 text-[#6a6a6a]" />
                邮箱
              </label>
              <div className="w-full px-4 py-3 bg-[#f7f7f7] border border-[#dddddd] rounded-xl text-[#6a6a6a]">
                {session?.user?.email}
              </div>
            </div>

            {/* 角色字段（只读） */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#222222] mb-3">
                <Shield className="h-4 w-4 text-[#6a6a6a]" />
                角色
              </label>
              <div className="inline-flex items-center gap-2 px-4 py-3 bg-[#f7f7f7] border border-[#dddddd] rounded-xl text-[#222222]">
                <span className={`w-2 h-2 rounded-full ${
                  (session?.user as any)?.role === "ADMIN"
                    ? "bg-[#ff385c]"
                    : (session?.user as any)?.role === "TENANTADMIN"
                    ? "bg-[#008489]"
                    : "bg-[#6a6a6a]"
                }`} />
                {(session?.user as any)?.role === "ADMIN"
                  ? "超级管理员"
                  : (session?.user as any)?.role === "TENANTADMIN"
                  ? "租户管理员"
                  : "普通用户"}
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#ff385c] text-white font-medium rounded-xl hover:bg-[#e31c5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              保存修改
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Building2, Users } from "lucide-react"

export default function AdminDashboardPage() {
  const { data: session } = useSession()

  const menuItems = [
    {
      title: "租户管理",
      description: "管理系统租户及租户管理员账号",
      href: "/admin/tenants",
      icon: Building2,
      color: "blue",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">欢迎回来，管理员</h1>
        <p className="text-gray-600 mt-1">管理系统配置和租户</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className={`h-12 w-12 bg-${item.color}-100 rounded-lg flex items-center justify-center mb-4`}>
              <item.icon className={`h-6 w-6 text-${item.color}-600`} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

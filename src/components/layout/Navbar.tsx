"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Sparkles, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Navbar() {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <nav className="sticky top-0 z-50 h-[80px] w-full bg-white border-b border-[#ebebeb] shadow-sm">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-[#ff385c]" />
          <span className="text-xl font-bold text-[#222222]">店诸葛</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/shops" className="text-[#222222] hover:text-[#ff385c] transition-colors">
            门店管理
          </Link>
          <Link href="/analytics" className="text-[#222222] hover:text-[#ff385c] transition-colors">
            数据分析
          </Link>
          <Link href="/ai-assistant" className="text-[#222222] hover:text-[#ff385c] transition-colors">
            AI 助手
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 border border-[#dddddd] rounded-full hover:shadow-md transition-shadow"
              >
                <Menu className="h-4 w-4 text-[#222222]" />
                <div className="w-8 h-8 bg-[#717171] rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-14 w-48 bg-white rounded-xl shadow-lg border border-[#ebebeb] py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#ebebeb]">
                    <p className="text-sm font-medium text-[#222222]">{session.user?.name || "用户"}</p>
                    <p className="text-xs text-[#6a6a6a]">{session.user?.email}</p>
                  </div>
                  {(session.user as any)?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-[#222222] hover:bg-[#f7f7f7]"
                      onClick={() => setShowUserMenu(false)}
                    >
                      管理后台
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-[#222222] hover:bg-[#f7f7f7]"
                    onClick={() => setShowUserMenu(false)}
                  >
                    控制台
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-[#222222] hover:bg-[#f7f7f7]"
                    onClick={() => setShowUserMenu(false)}
                  >
                    设置
                  </Link>
                  <div className="border-t border-[#ebebeb] mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        signOut()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-[#222222] hover:bg-[#f7f7f7]"
                    >
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  注册
                </Button>
              </Link>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}

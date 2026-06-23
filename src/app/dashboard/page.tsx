"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Store,
  BarChart3,
  PenTool,
  MessageSquare,
  Globe,
  Wallet,
  Handshake,
  Briefcase,
  Newspaper,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Loader2 } from "lucide-react"

const modules = [
  {
    id: 1,
    title: "开店决策与商业计划",
    titleEn: "Store Opening Decision & Business Plan",
    description: "AI 智能选址分析、市场调研、商业计划书生成",
    icon: Store,
    gradientFrom: "#ff385c",
    gradientTo: "#ff5e84",
    bgColor: "#fff1f3",
    hoverColor: "#ff385c",
    path:"/plan"
  },
  {
    id: 2,
    title: "经营数据与复盘",
    titleEn: "Business Data & Review",
    description: "多平台数据聚合、经营报表、智能复盘分析",
    icon: BarChart3,
    gradientFrom: "#008489",
    gradientTo: "#00a693",
    bgColor: "#e6f7f5",
    hoverColor: "#008489",
    path:"/review"
  },
  {
    id: 3,
    title: "内容创作与营销",
    titleEn: "Content Creation & Marketing",
    description: "AI 文案生成、图文设计、短视频脚本、营销策略",
    icon: PenTool,
    gradientFrom: "#7c3aed",
    gradientTo: "#a78bfa",
    bgColor: "#f5f3ff",
    hoverColor: "#7c3aed",
    path:"/marketing"
  },
  {
    id: 4,
    title: "评论口碑与私域",
    titleEn: "Reviews Reputation & Private Domain",
    description: "评论智能回复、口碑管理、私域流量运营",
    icon: MessageSquare,
    gradientFrom: "#f59e0b",
    gradientTo: "#fbbf24",
    bgColor: "#fffbeb",
    hoverColor: "#f59e0b",
    path:"/domain"
  },
  {
    id: 5,
    title: "平台运营与投流",
    titleEn: "Platform Operation & Advertising",
    description: "平台规则解读、运营优化、投放策略、ROI 分析",
    icon: Globe,
    gradientFrom: "#0ea5e9",
    gradientTo: "#38bdf8",
    bgColor: "#f0f9ff",
    hoverColor: "#0ea5e9",
    path:"/operation"
  },
  {
    id: 6,
    title: "财务库存人员管理",
    titleEn: "Finance Inventory & Staff Management",
    description: "财务管理、库存监控、人员排班、绩效分析",
    icon: Wallet,
    gradientFrom: "#10b981",
    gradientTo: "#34d399",
    bgColor: "#ecfdf5",
    hoverColor: "#10b981",
    path:"/finance"
  },
  {
    id: 7,
    title: "资源对接与服务履约",
    titleEn: "Resource Matching & Service Fulfillment",
    description: "供应链对接、服务商匹配、服务质量监控",
    icon: Handshake,
    gradientFrom: "#ec4899",
    gradientTo: "#f472b6",
    bgColor: "#fdf2f8",
    hoverColor: "#ec4899",
    path:"/resource"
  },
  {
    id: 8,
    title: "代运营工作台与客户管理",
    titleEn: "Agency Operation Workbench & Client Management",
    description: "代运营项目管理、客户关系管理、服务进度跟踪",
    icon: Briefcase,
    gradientFrom: "#6366f1",
    gradientTo: "#818cf8",
    bgColor: "#eef2ff",
    hoverColor: "#6366f1",
    path:"/agency"
  },
  {
    id: 9,
    title: "行业外部信息",
    titleEn: "Industry External Information",
    description: "行业动态、竞品分析、政策解读、趋势预测",
    icon: Newspaper,
    gradientFrom: "#8b5cf6",
    gradientTo: "#a78bfa",
    bgColor: "#faf5ff",
    hoverColor: "#8b5cf6",
    path:"/industry"
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

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

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-[#f7f7f7] to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部区域 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#ff385c] to-[#ff5e84] flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#222222]">
                欢迎回来，{session?.user?.name || "用户"}
              </h1>
              <p className="text-[#6a6a6a] mt-1">
                选择一个模块，开始您的智能经营之旅
              </p>
            </div>
          </div>
        </div>

        {/* 模块卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon
            const isHovered = hoveredCard === module.id

            return (
              <Link
                key={module.id}
                href={module.path}
                className="group relative"
                onMouseEnter={() => setHoveredCard(module.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <div
                  className={`
                    relative h-full rounded-2xl border border-[#ebebeb] bg-white
                    transition-all duration-300 ease-out cursor-pointer overflow-hidden
                    ${isHovered ? "shadow-2xl scale-[1.02] -translate-y-1" : "shadow-sm hover:shadow-lg"}
                  `}
                  style={{
                    borderColor: isHovered ? module.hoverColor : "#ebebeb",
                  }}
                >
                  {/* 顶部渐变条 */}
                  <div
                    className="h-2 w-full transition-all duration-300"
                    style={{
                      background: `linear-gradient(to right, ${module.gradientFrom}, ${module.gradientTo})`,
                      height: isHovered ? "8px" : "4px",
                    }}
                  />

                  <div className="p-6">
                    {/* 图标区域 */}
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className="h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300"
                        style={{
                          backgroundColor: isHovered
                            ? module.hoverColor
                            : module.bgColor,
                          transform: isHovered ? "scale(1.1) rotate(-5deg)" : "scale(1)",
                        }}
                      >
                        <Icon
                          className="h-7 w-7 transition-all duration-300"
                          style={{
                            color: isHovered ? "#ffffff" : module.gradientFrom,
                          }}
                        />
                      </div>

                      {/* 箭头指示器 */}
                      <div
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300"
                        style={{
                          backgroundColor: isHovered ? module.bgColor : "transparent",
                          color: isHovered ? module.hoverColor : "#6a6a6a",
                          opacity: isHovered ? 1 : 0,
                          transform: isHovered ? "translateX(0)" : "translateX(-10px)",
                        }}
                      >
                        进入
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    {/* 标题 */}
                    <h3 className="text-xl font-bold text-[#222222] mb-2 transition-all duration-300">
                      {module.title}
                    </h3>

                    {/* 英文标题 */}
                    <p
                      className="text-xs font-medium mb-3 tracking-wide"
                      style={{ color: module.gradientFrom }}
                    >
                      {module.titleEn}
                    </p>

                    {/* 描述 */}
                    <p className="text-sm text-[#6a6a6a] leading-relaxed">
                      {module.description}
                    </p>

                    {/* 底部装饰线 */}
                    <div
                      className="mt-5 h-px rounded-full transition-all duration-500"
                      style={{
                        background: `linear-gradient(to right, transparent, ${module.gradientFrom}, transparent)`,
                        opacity: isHovered ? 0.6 : 0.2,
                      }}
                    />
                  </div>

                  {/* 悬停时的发光效果 */}
                  {isHovered && (
                    <div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        boxShadow: `inset 0 0 30px ${module.gradientFrom}15`,
                      }}
                    />
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* 底部提示 */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#6a6a6a]">
            所有功能均由 AI 驱动，助您实现智能化经营管理
          </p>
        </div>
      </div>

      {/* 全局动画样式 */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

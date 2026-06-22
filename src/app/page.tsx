import { Sparkles, BarChart3, Users, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Home() {
  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-[#ff385c]" />,
      title: "智能数据分析",
      description: "AI 驱动的数据分析，自动识别经营问题并给出优化建议",
    },
    {
      icon: <Users className="h-8 w-8 text-[#ff385c]" />,
      title: "客户智能管理",
      description: "自动标签分类、RFM 分析，精准触达高价值客户",
    },
    {
      icon: <Zap className="h-8 w-8 text-[#ff385c]" />,
      title: "AI 智能助手",
      description: "7x24 小时在线，解答经营疑问，生成运营方案",
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-white to-[#f7f7f7]">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-[#ff385c]/10 text-[#ff385c] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>AI 驱动的本地生活智能服务平台</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-[#222222] mb-6 leading-tight">
            让门店经营
            <span className="text-[#ff385c]">更简单</span>
          </h1>
          <p className="text-xl text-[#6a6a6a] mb-10 max-w-2xl mx-auto">
            店诸葛用 AI 赋能实体门店，提供智能分析、客户管理、营销自动化等一站式解决方案
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base">
              免费开始使用
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-base">
              预约演示
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-4">
              核心功能
            </h2>
            <p className="text-lg text-[#6a6a6a] max-w-2xl mx-auto">
              专为本地生活商家打造的智能经营工具
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 border-[#ebebeb] hover:shadow-lg transition-shadow">
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-[#222222] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#6a6a6a]">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#ff385c]">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            准备好开启智能经营之旅了吗？
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            立即注册，免费试用 14 天，无需信用卡
          </p>
          <Button size="lg" className="bg-white text-[#ff385c] hover:bg-gray-100 text-base">
            立即免费注册
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}

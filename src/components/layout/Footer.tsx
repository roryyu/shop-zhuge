import Link from "next/link"
import { Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#f7f7f7] border-t border-[#ebebeb]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-[#ff385c]" />
              <span className="text-lg font-bold text-[#222222]">店诸葛</span>
            </div>
            <p className="text-sm text-[#6a6a6a]">
              本地生活智能服务平台，让门店经营更简单
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#222222] mb-4">产品</h4>
            <ul className="space-y-2 text-sm text-[#6a6a6a]">
              <li><Link href="/shops" className="hover:text-[#ff385c]">门店管理</Link></li>
              <li><Link href="/analytics" className="hover:text-[#ff385c]">数据分析</Link></li>
              <li><Link href="/ai-assistant" className="hover:text-[#ff385c]">AI 助手</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#222222] mb-4">资源</h4>
            <ul className="space-y-2 text-sm text-[#6a6a6a]">
              <li><Link href="/docs" className="hover:text-[#ff385c]">帮助文档</Link></li>
              <li><Link href="/blog" className="hover:text-[#ff385c]">运营博客</Link></li>
              <li><Link href="/api" className="hover:text-[#ff385c]">API 文档</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#222222] mb-4">联系我们</h4>
            <ul className="space-y-2 text-sm text-[#6a6a6a]">
              <li>客服热线：400-xxx-xxxx</li>
              <li>邮箱：support@shopzhuge.com</li>
              <li>工作时间：9:00 - 18:00</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#ebebeb] text-center text-sm text-[#6a6a6a]">
          <p>&copy; 2024 店诸葛. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

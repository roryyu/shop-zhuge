"use client"

import { useEffect } from "react"

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 隐藏全局的 Navbar 和 Footer
  useEffect(() => {
    // 查找并隐藏 Navbar 和 Footer
    const hideElements = () => {
      const nav = document.querySelector('nav')
      const footer = document.querySelector('footer')
      if (nav) nav.style.display = 'none'
      if (footer) footer.style.display = 'none'
    }
    
    hideElements()
    
    // 监听 DOM 变化，确保元素被隐藏
    const observer = new MutationObserver(hideElements)
    observer.observe(document.body, { childList: true, subtree: true })
    
    return () => {
      observer.disconnect()
      // 恢复显示
      const nav = document.querySelector('nav')
      const footer = document.querySelector('footer')
      if (nav) nav.style.display = ''
      if (footer) footer.style.display = ''
    }
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden">
      {children}
    </div>
  )
}

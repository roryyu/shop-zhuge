# 🚀 店诸葛（本地生活智能服务平台）

**项目名称**: ShopZhuge  
**核心定位**: 本地生活智能服务平台。

---

## 1. 环境配置与技术栈 (Environment & Tech Stack)

| 层级 | 技术选型 |
|------|---------|
| **框架** | Next.js 14 (App Router) |
| **语言** | TypeScript |
| **样式** | Tailwind CSS + Airbnb 设计令牌 |
| **UI 组件** | 基于 Radix UI |
| **数据库** | PostgreSQL |
| **ORM** | Prisma |
| **认证** | NextAuth.js v5（邮箱密码 + 手机验证码双通道） |
| **AI** | OpenAI SDK → DeepSeek V4 pro / 火山引擎 Ark（可切换） |
| **向量检索** | 火山引擎 Embedding + PostgreSQL 向量存储 |


## 2. 设计系统 (Design System)

项目采用 **Airbnb 设计令牌**，全局 CSS 变量定义在 `app/globals.css`：

| 令牌 | 色值 | 用途 |
|------|------|------|
| `--primary` | `#ff385c` (Rausch) | 主色调、CTA 按钮 |
| `--foreground` | `#222222` (ink) | 主文字色 |
| `--muted-foreground` | `#6a6a6a` | 辅助文字 |
| `--border` | `#dddddd` | 边框 |
| `--surface-soft` | `#f7f7f7` | 柔灰背景 |
| `--hairline-soft` | `#ebebeb` | 细分割线 |
| `--radius` | `0.5rem` (8px) | 默认圆角 |

**核心 UI 组件** (`components/ui/`):
- `button.tsx` — 按钮（primary/outline/ghost/destructive）
- `input.tsx` / `textarea.tsx` / `select.tsx` — 表单控件
- `card.tsx` — 卡片容器
- `dialog.tsx` / `popover.tsx` / `command.tsx` — 浮层组件
- `badge.tsx` / `label.tsx` / `progress.tsx` / `switch.tsx` — 辅助组件
- `loading.tsx` — 加载状态
- `markdown-editor.tsx` — Markdown 编辑器

**布局组件** (`components/layout/`):
- `Navbar.tsx` — 全局导航栏（80px 白色，Airbnb 三层阴影，Rausch CTA）
- `Footer.tsx` — 全局页脚

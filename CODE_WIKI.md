# 店诸葛 - Code Wiki 文档

## 1. 项目概述

### 1.1 基本信息
- **项目名称**: ShopZhuge (店诸葛)
- **核心定位**: 本地生活智能服务平台
- **版本**: 0.1.0
- **类型**: Next.js 16.2.9 全栈应用 (App Router)

### 1.2 项目简介
店诸葛是一个AI驱动的本地生活智能服务平台，旨在为实体门店提供智能分析、客户管理、营销自动化等一站式解决方案。平台通过集成DeepSeek/火山引擎AI能力，为用户提供智能选址分析、市场调研、商业计划书生成、经营数据分析、内容创作、评论口碑管理等9大核心模块服务。

### 1.3 设计系统
项目采用 **Airbnb 设计令牌**，全局 CSS 变量定义在 [app/globals.css](file:///workspace/src/app/globals.css):

| 令牌 | 色值 | 用途 |
|------|------|------|
| `--primary` | `#ff385c` (Rausch) | 主色调、CTA 按钮 |
| `--foreground` | `#222222` (ink) | 主文字色 |
| `--muted-foreground` | `#6a6a6a` | 辅助文字 |
| `--border` | `#dddddd` | 边框 |
| `--surface-soft` | `#f7f7f7` | 柔灰背景 |
| `--hairline-soft` | `#ebebeb` | 细分割线 |
| `--radius` | `0.5rem` (8px) | 默认圆角 |

---

## 2. 整体架构

### 2.1 架构设计图
```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层 (React 19)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  首页    │  │ Dashboard│  │  Plan    │  │  Admin   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Login   │  │ Register │  │ Settings │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTPS/REST
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   API Routes Layer                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ /api/plan│  │/api/auth │  │/api/admin│           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │/api/user │  │/api/tenant│ │/api/plan │           │  │
│  │  │          │  │  /users  │  │  /stream │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Service Layer                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ Auth Svc │  │  AI Svc  │  │Prisma Svc│           │  │
│  │  │NextAuth  │  │OpenAI SDK│  │  Client  │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓ SQL/HTTP
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                               │
│  ┌──────────────────┐        ┌─────────────────────┐       │
│  │   PostgreSQL     │        │  AI Provider API    │       │
│  │  (Prisma ORM)    │        │  DeepSeek / Ark     │       │
│  │  Schema: shopzhuge│        │                     │       │
│  └──────────────────┘        └─────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 架构特点
- **单体架构**: Next.js全栈应用，前后端一体化
- **App Router**: 使用Next.js 16最新的App Router模式
- **Server-First**: 优先使用Server Components，减少客户端JavaScript
- **API Routes**: RESTful API设计，支持SSE流式响应
- **多层权限**: ADMIN/TENANTADMIN/USER三级权限体系
- **多租户架构**: 支持租户隔离和模块权限控制

---

## 3. 技术栈

### 3.1 核心技术栈
| 层级 | 技术选型 | 版本 | 说明 |
|------|---------|------|------|
| **框架** | Next.js | 16.2.9 | App Router模式，支持React 19 |
| **语言** | TypeScript | 5.x | 严格类型检查 |
| **UI框架** | React | 19.2.4 | 最新React版本 |
| **样式** | Tailwind CSS | 4.x | PostCSS集成 |
| **UI组件** | Radix UI | 多版本 | 无样式组件库 |
| **数据库** | PostgreSQL | - | Prisma ORM管理 |
| **ORM** | Prisma | 7.8.0 | 类型安全的数据访问 |
| **认证** | NextAuth.js | 5.0.0-beta.31 | JWT session策略 |
| **AI SDK** | OpenAI SDK | 6.44.0 | 支持DeepSeek/火山引擎 |
| **图标** | Lucide React | 1.21.0 | 现代图标库 |
| **Markdown** | react-markdown | 10.1.0 | Markdown渲染 |

### 3.2 关键依赖
#### 生产依赖
```json
{
  "@auth/prisma-adapter": "^2.11.2",      // Prisma适配器
  "@prisma/client": "^7.8.0",             // Prisma客户端
  "@prisma/adapter-pg": "^7.8.0",         // PostgreSQL适配器
  "bcryptjs": "^3.0.3",                   // 密码加密
  "openai": "^6.44.0",                    // OpenAI API客户端
  "react-markdown": "^10.1.0",            // Markdown渲染
  "rehype-raw": "^7.0.0",                 // HTML支持
  "remark-gfm": "^4.0.1"                  // GitHub风格Markdown
}
```

#### 开发依赖
```json
{
  "prisma": "^7.8.0",                     // Prisma CLI
  "@tailwindcss/postcss": "^4",           // PostCSS插件
  "eslint": "^9",                         // 代码检查
  "eslint-config-next": "16.2.9"          // Next.js ESLint配置
}
```

---

## 4. 目录结构

### 4.1 项目根目录
```
/workspace/
├── .trae/                          # Trae IDE配置
│   └── rules/
│       └── prisma.md              # Prisma开发规则
├── prisma/                         # Prisma数据库配置
│   ├── schema.prisma              # 数据库模型定义
│   ├── seed.ts                    # 数据库种子脚本
│   ├── check-password.ts          # 密码检查工具
│   └── migrations/                # SQL迁移历史
│       ├── migration_lock.toml
│       └── 20260622050856_init/
│       ├── 20260622050900_del_tenant_productid/
│       ├── 20260622053000_add_unique_module_to_opening_decision_setting/
│       ├── 20260622060000_add_info_to_opening_decision_setting/
│       └── 20260622063000_add_tenant_module_permission/
├── public/                         # 静态资源
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/                            # 源代码目录
│   ├── app/                        # Next.js App Router
│   ├── components/                 # React组件
│   ├── lib/                        # 工具库
│   ├── types/                      # 类型定义
│   ├── auth.ts                     # NextAuth导出
│   └ auth.config.ts                # NextAuth配置
├── types/                          # 全局类型定义
│   ├── cache-life.d.ts
│   └── routes.d.ts
├── .env.example                    # 环境变量示例
├── package.json                    # 项目配置
├── tsconfig.json                   # TypeScript配置
├── next.config.ts                  # Next.js配置
├── prisma.config.ts                # Prisma配置
├── postcss.config.mjs              # PostCSS配置
├── eslint.config.mjs               # ESLint配置
├── AGENTS.md                       # Agent规则文档
├── CLAUDE.md                       # Claude规则文档
└── README.md                       # 项目说明文档
```

### 4.2 源代码目录详解
```
src/
├── app/                            # Next.js App Router页面
│   ├── admin/                      # 管理后台
│   │   ├── layout.tsx             # 管理员布局
│   │   ├── page.tsx               # 管理首页
│   │   ├── prompt-settings/       # Prompt设置管理
│   │   │   └ page.tsx
│   │   └ tenants/                  # 租户管理
│   │   │   └ page.tsx
│   ├── api/                        # API路由
│   │   ├── admin/                  # 管理API
│   │   │   ├── prompt-settings/
│   │   │   │   └ route.ts         # Prompt设置CRUD
│   │   │   └ tenants/
│   │   │   │   ├── route.ts       # 租户列表/创建
│   │   │   │   └ [id]/route.ts    # 租户更新/删除
│   │   ├── auth/                   # 认证API
│   │   │   ├── [...nextauth]/
│   │   │   │   └ route.ts         # NextAuth路由
│   │   │   └ register/
│   │   │   │   └ route.ts         # 用户注册
│   │   ├── plan/                   # 计划模块API
│   │   │   ├── route.ts           # 普通响应
│   │   │   ├── stream/
│   │   │   │   └ route.ts         # SSE流式响应
│   │   ├── tenant/                 # 租户管理API
│   │   │   └ users/
│   │   │   │   ├── route.ts       # 用户列表/创建
│   │   │   │   └ [id]/route.ts    # 用户更新/删除
│   │   ├── user/
│   │   │   └ route.ts              # 用户信息API
│   ├── dashboard/                  # 用户控制台
│   │   └ page.tsx                  # 9大模块展示
│   ├── login/                      # 登录页
│   │   └ page.tsx
│   ├── plan/                       # 开店决策与商业计划
│   │   ├── layout.tsx
│   │   ├── page.tsx                # AI对话界面
│   │   ├── markdown.css            # Markdown样式
│   ├── register/                   # 注册页
│   │   └ page.tsx
│   ├── settings/                   # 用户设置
│   │   └ page.tsx
│   ├── tenant/                     # 租户管理区
│   │   ├── layout.tsx
│   │   ├── users/
│   │   │   └ page.tsx              # 租户用户管理
│   ├── favicon.ico
│   ├── globals.css                 # 全局样式(Airbnb设计令牌)
│   ├── layout.tsx                  # 根布局
│   ├── page.tsx                    # 首页
│   └ providers.tsx                 # SessionProvider包装
├── components/                     # React组件
│   ├── layout/                     # 布局组件
│   │   ├── Footer.tsx             # 全局页脚
│   │   ├── Navbar.tsx             # 全局导航栏
│   ├── ui/                         # UI基础组件
│   │   ├── badge.tsx              # 标签
│   │   ├── button.tsx             # 按钮(primary/outline/ghost)
│   │   ├── card.tsx               # 卡片容器
│   │   ├── input.tsx              # 输入框
│   │   ├── label.tsx              # 标签
│   │   ├── loading.tsx            # 加载状态
│   │   ├── progress.tsx           # 进度条
│   │   ├── select.tsx             # 下拉选择
│   │   ├── switch.tsx             # 开关
│   │   ├── textarea.tsx           # 文本域
├── lib/                            # 工具库
│   ├── utils/                      # 工具函数
│   │   └ json.ts                  # JSON解析工具
│   ├── ai.ts                       # AI服务封装
│   ├── prisma.ts                   # Prisma客户端单例
│   ├── utils.ts                    # Tailwind工具函数
├── types/                          # 类型定义
│   └ next-auth.d.ts                # NextAuth类型扩展
├── auth.ts                         # NextAuth导出
├── auth.config.ts                  # NextAuth配置(Credentials)
```

---

## 5. 主要模块职责

### 5.1 页面模块

#### 5.1.1 首页 ([src/app/page.tsx](file:///workspace/src/app/page.tsx))
- **职责**: 产品介绍和营销落地页
- **核心功能**:
  - Hero区域展示产品定位
  - 核心功能介绍(智能数据分析、客户智能管理、AI智能助手)
  - CTA引导用户注册
- **设计特点**: Airbnb设计风格，渐变背景，卡片布局

#### 5.1.2 控制台 ([src/app/dashboard/page.tsx](file:///workspace/src/app/dashboard/page.tsx))
- **职责**: 用户登录后的主控制台
- **核心功能**:
  - 展示9大功能模块卡片
  - 模块包括:
    1. 开店决策与商业计划 (`/plan`)
    2. 经营数据与复盘 (`/review`)
    3. 内容创作与营销 (`/marketing`)
    4. 评论口碑与私域 (`/domain`)
    5. 平台运营与投流 (`/operation`)
    6. 财务库存人员管理 (`/finance`)
    7. 资源对接与服务履约 (`/resource`)
    8. 代运营工作台与客户管理 (`/agency`)
    9. 行业外部信息 (`/industry`)
- **交互特点**: 
  - 悬停动画效果(scale, rotate, shadow)
  - 渐变色彩主题
  - 淡入淡出动画

#### 5.1.3 开店决策与商业计划 ([src/app/plan/page.tsx](file:///workspace/src/app/plan/page.tsx))
- **职责**: AI对话界面，提供开店决策咨询
- **核心功能**:
  - 模块选择下拉框
  - AI对话输入框
  - SSE流式响应显示
  - Markdown渲染(支持GitHub风格)
  - 历史记录查看
- **支持模块**:
  - 开店咨询、品类选择建议、商圈筛选
  - 品牌定位建议、证照/上线办理清单
  - 店铺流程/SOP/筹备清单、定价建议
  - 团购套餐设计、上线检查清单、营销建议

#### 5.1.4 管理后台 ([src/app/admin/layout.tsx](file:///workspace/src/app/admin/layout.tsx))
- **职责**: 系统管理界面
- **权限**: ADMIN角色
- **核心功能**:
  - Prompt设置管理
  - 租户管理
  - 用户权限控制
- **安全**: 权限检查，未授权重定向

#### 5.1.5 租户管理 ([src/app/tenant/layout.tsx](file:///workspace/src/app/tenant/layout.tsx))
- **职责**: 租户管理员界面
- **权限**: TENANTADMIN角色
- **核心功能**:
  - 租户用户管理
  - 租户模块权限分配

### 5.2 API路由模块

#### 5.2.1 计划模块API ([src/app/api/plan/route.ts](file:///workspace/src/app/api/plan/route.ts))
- **职责**: 处理开店决策AI对话请求
- **端点**:
  - `GET /api/plan`: 获取历史记录和模块设置
  - `POST /api/plan`: 发送对话请求(普通响应)
- **核心逻辑**:
  - 用户认证检查
  - 模块Prompt获取
  - **上下文压缩**: 将历史对话总结为新的系统提示词
  - AI调用与响应保存
- **上下文压缩算法**:
  ```
  历史对话 → AI总结 → 300字摘要 → 新系统提示词 → 回答新问题
  ```

#### 5.2.2 流式响应API ([src/app/api/plan/stream/route.ts](file:///workspace/src/app/api/plan/stream/route.ts))
- **职责**: 提供SSE流式AI响应
- **端点**: `POST /api/plan/stream`
- **核心特点**:
  - Server-Sent Events (SSE)协议
  - 实时流式输出AI响应
  - 异步保存对话记录
  - 支持上下文压缩
- **响应格式**:
  ```
  data: {"content": "文本块"}
  data: {"recordId": "xxx"}
  data: [DONE]
  ```

#### 5.2.3 认证API ([src/app/api/auth/register/route.ts](file:///workspace/src/app/api/auth/register/route.ts))
- **职责**: 用户注册
- **端点**: `POST /api/auth/register`
- **验证逻辑**:
  - 邮箱格式验证
  - 密码长度验证(≥6位)
  - 邮箱唯一性检查
  - bcrypt密码加密

#### 5.2.4 管理API
- **Prompt设置API** ([src/app/api/admin/prompt-settings/route.ts](file:///workspace/src/app/api/admin/prompt-settings/route.ts)):
  - CRUD操作
  - 模块Prompt管理
- **租户API** ([src/app/api/admin/tenants/route.ts](file:///workspace/src/app/api/admin/tenants/route.ts)):
  - 租户创建/列表
  - 租户模块权限分配
- **租户用户API** ([src/app/api/tenant/users/route.ts](file:///workspace/src/app/api/tenant/users/route.ts)):
  - 租户内用户管理

---

## 6. 数据库模型

### 6.1 核心数据模型 ([prisma/schema.prisma](file:///workspace/prisma/schema.prisma))

#### 6.1.1 多租户模型
```prisma
model Tenant {
  id                    String                    @id @default(cuid())
  name                  String?
  createdAt             DateTime                  @default(now())
  updatedAt             DateTime                  @updatedAt
  users                 User[]
  modulePermissions     TenantModulePermission[]
}

model TenantModulePermission {
  id                          String   @id @default(cuid())
  tenantId                    String
  storeOpeningConsultation    Boolean  @default(true)
  categorySelectionAdvice     Boolean  @default(true)
  locationScreening           Boolean  @default(true)
  brandPositioningAdvice      Boolean  @default(true)
  licenseAndLaunchChecklist   Boolean  @default(true)
  storeOpeningProcessSOP      Boolean  @default(true)
  priceSuggestion             Boolean  @default(true)
  groupPurchasePackageDesign  Boolean  @default(true)
  marketingAdvice             Boolean  @default(true)
  createdAt                   DateTime @default(now())
  updatedAt                   DateTime @updatedAt
  
  tenant                      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  @@unique([tenantId])
}
```

#### 6.1.2 用户与认证模型
```prisma
model User {
  id                     String                  @id @default(cuid())
  email                  String                  @unique
  phone                  String?                 @unique
  password               String
  name                   String?
  role                   String                  @default("USER")  // USER/TENANTADMIN/ADMIN
  tenantId               String?
  createdAt              DateTime                @default(now())
  updatedAt              DateTime                @updatedAt
  aiConversations        AIConversation[]
  openingDecisionRecords OpeningDecisionRecord[]
  sessions               Session[]
  tenant                 Tenant?                 @relation(fields: [tenantId], references: [id])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### 6.1.3 AI对话记录模型
```prisma
model OpeningDecisionSetting {
  id        String   @id @default(cuid())
  module    String   @unique  // 模块标识符
  prompt    String?           // 系统Prompt
  info      String?           // 模块信息
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model OpeningDecisionRecord {
  id                String   @id @default(cuid())
  userId            String
  module            String?           // 模块类型
  userPrompt        String?           // 用户输入
  assistantResponse String?           // AI回答
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AIConversation {
  id        String   @id @default(cuid())
  userId    String?
  userName  String?
  module    String                    // 模块名称
  model     String                    // AI模型
  prompt    String                    // 用户提示
  response  String?                   // AI响应
  tokens    Int?                      // Token消耗
  duration  Int?                      // 持续时间(ms)
  error     String?                   // 错误信息
  metadata  String?                   // 元数据(JSON)
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([userName])
  @@index([module])
  @@index([createdAt])
}
```

#### 6.1.4 其他模型
```prisma
model Document {
  id          String   @id @default(cuid())
  fileName    String?
  fileType    String?
  content     String?
  fileData    String?
  status      String   @default("pending")
  directoryId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SystemSetting {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt
}
```

### 6.2 数据库配置
- **数据库**: PostgreSQL
- **Schema**: `shopzhuge`
- **适配器**: PrismaPg (Prisma PostgreSQL Adapter)
- **迁移策略**: 严格使用Prisma迁移，禁止`db push`

---

## 7. 关键类与函数说明

### 7.1 AI服务模块 ([src/lib/ai.ts](file:///workspace/src/lib/ai.ts))

#### 7.1.1 核心函数

##### `getAIProvider(): AIProvider`
- **功能**: 获取当前AI提供商配置
- **返回**: `'deepseek'` | `'ark'`
- **配置**: 通过环境变量 `AI_PROVIDER` 控制

##### `getAIClient(): OpenAI`
- **功能**: 获取AI客户端实例(延迟初始化)
- **特点**: 单例模式，避免构建时依赖API Key
- **支持**:
  - DeepSeek: `AI_API_KEY` + `AI_BASE_URL`
  - 火山引擎: `ARK_API_KEY` + `ARK_BASE_URL`

##### `getDefaultModel(): string`
- **功能**: 获取默认模型名称
- **返回**:
  - DeepSeek: `deepseek-chat`
  - Ark: `doubao-pro-32k-2411`

##### `chatWithLogging(options, context)`
- **功能**: 带日志记录的聊天完成API
- **参数**:
  - `options`: 模型、消息、温度等参数
  - `context`: 模块名称、用户ID、元数据
- **特点**:
  - 详细日志输出(请求、响应、Token使用)
  - 自动保存对话记录到数据库
  - 错误处理与记录

##### `streamChatWithLogging(options, context): AsyncGenerator<string>`
- **功能**: 带日志记录的流式聊天API
- **返回**: AsyncGenerator，逐块返回内容
- **特点**:
  - SSE流式响应
  - 异步保存记录(不阻塞流式返回)
  - Usage统计(通过`stream_options.include_usage`)
  - 可调试模式(`AI_STREAM_DEBUG=1`)

##### `createEmbedding(input, model?): Promise<number[][]>`
- **功能**: 文本/多模态向量化
- **支持**:
  - DeepSeek: 标准embedding接口
  - Ark: 多模态embedding接口(文本+图片)
- **用途**: RAG向量检索

#### 7.1.2 数据类型
```typescript
export type AIProvider = 'deepseek' | 'ark';

export interface EmbeddingInput {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string }
}

export interface EmbeddingResult {
  object: string
  embedding: number[]
  index: number
}
```

### 7.2 Prisma客户端 ([src/lib/prisma.ts](file:///workspace/src/lib/prisma.ts))

#### `prismaClientSingleton(): PrismaClient`
- **功能**: 创建Prisma客户端单例
- **配置**:
  - PostgreSQL连接字符串
  - Schema: `shopzhuge`
  - 开发环境日志: `query`, `error`, `warn`
  - 生产环境日志: `error`
- **特点**: 全局单例，避免热重载创建多个实例

### 7.3 认证配置 ([src/auth.config.ts](file:///workspace/src/auth.config.ts))

#### NextAuth配置
- **Session策略**: JWT
- **Provider**: Credentials (邮箱密码登录)
- **Adapter**: PrismaAdapter
- **回调函数**:
  - `jwt`: 添加用户ID和角色到token
  - `session`: 将token信息传递到session
- **页面配置**:
  - 登录页: `/login`
  - 错误页: `/login`
- **密码验证**: bcrypt.compare

### 7.4 UI组件 ([src/components/ui/](file:///workspace/src/components/ui))

#### Button组件 ([src/components/ui/button.tsx](file:///workspace/src/components/ui/button.tsx))
- **变体**: `primary`, `outline`, `ghost`, `destructive`
- **尺寸**: `sm`, `md`, `lg`
- **样式**: Airbnb设计风格，Rausch主色调

#### Card组件 ([src/components/ui/card.tsx](file:///workspace/src/components/ui/card.tsx))
- **用途**: 内容容器
- **样式**: 白色背景，淡灰边框，圆角

#### 输入组件
- `input.tsx`: 文本输入框
- `textarea.tsx`: 多行文本输入
- `select.tsx`: 下拉选择框
- `switch.tsx`: 开关切换

### 7.5 布局组件 ([src/components/layout/](file:///workspace/src/components/layout))

#### Navbar ([src/components/layout/Navbar.tsx](file:///workspace/src/components/layout/Navbar.tsx))
- **高度**: 80px
- **样式**: 白色背景，淡灰边框，淡阴影
- **功能**:
  - Logo与品牌名
  - 导航链接(门店计划、数据分析、AI运营)
  - 用户菜单(根据角色显示):
    - ADMIN: 管理后台
    - TENANTADMIN: 租户管理
    - USER: 控制台、设置
  - 登录/注册按钮(未登录状态)
  - 退出登录

#### Footer ([src/components/layout/Footer.tsx](file:///workspace/src/components/layout/Footer.tsx))
- **职责**: 全局页脚
- **内容**: 版权信息、联系方式

---

## 8. 依赖关系

### 8.1 模块依赖图
```
┌─────────────────┐
│   Page Modules  │
│ (Dashboard/Plan)│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   UI Components │
│  (Button/Card)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Layout Comp.  │
│  (Navbar/Footer)│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Auth Service   │
│   (NextAuth)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐     ┌─────────────────┐
│   Prisma ORM    │────→│   PostgreSQL    │
│    Client       │     │   Database      │
└────────┬────────┘     └─────────────────┘
         │
         ↓
┌─────────────────┐     ┌─────────────────┐
│    AI Service   │────→│  AI Provider    │
│   (OpenAI SDK)  │     │(DeepSeek/Ark)   │
└─────────────────┘     └─────────────────┘
```

### 8.2 API调用链
```
Client Request
    ↓
API Route Handler
    ↓
Auth Middleware (auth())
    ↓
Business Logic
    ↓ ├─→ Prisma Client → PostgreSQL
      └─→ AI Client → DeepSeek/Ark API
    ↓
Response
    ↓ ├─→ JSON Response (普通API)
      └─→ SSE Stream (流式API)
```

### 8.3 关键依赖关系

#### 8.3.1 认证依赖
- `auth.ts` → `auth.config.ts` → NextAuth
- `auth.config.ts` → `PrismaAdapter` → `prisma.ts`
- `auth.config.ts` → bcrypt (密码加密)

#### 8.3.2 AI调用依赖
- `api/plan/route.ts` → `ai.ts` → OpenAI SDK
- `ai.ts` → `prisma.ts` (保存对话记录)
- `ai.ts` → 环境变量 (API配置)

#### 8.3.3 数据访问依赖
- 所有API路由 → `prisma.ts` → Prisma Client
- Prisma Client → PostgreSQL (SQL执行)
- Prisma Client → `@prisma/adapter-pg` (连接适配)

---

## 9. 项目运行方式

### 9.1 环境准备

#### 9.1.1 环境变量配置 (.env)
基于 [`.env.example`](file:///workspace/.env.example)，需要配置以下变量:

```bash
# 数据库连接
DATABASE_URL="postgresql://用户名:密码@主机:端口/数据库?schema=shopzhuge"

# NextAuth配置
NEXTAUTH_URL="http://localhost:3000"              # 应用URL
NEXTAUTH_SECRET="your-secret-key"                 # JWT签名密钥

# AI服务配置(二选一)
# DeepSeek配置
AI_PROVIDER="deepseek"
AI_API_KEY="your-deepseek-api-key"
AI_BASE_URL="https://api.deepseek.com/v1"        # 可选
AI_MODEL="deepseek-chat"                          # 可选

# 或火山引擎配置
AI_PROVIDER="ark"
ARK_API_KEY="your-ark-api-key"
ARK_BASE_URL="https://ark.cn-beijing.volces.com/api/v3"
ARK_MODEL="doubao-pro-32k-2411"
ARK_EMBEDDING_MODEL="doubao-embedding-vision-250615"

# 短信服务(可选)
SMS_PROVIDER="aliyun"
SMS_ACCESS_KEY_ID="your-access-key-id"
SMS_ACCESS_KEY_SECRET="your-access-key-secret"
SMS_SIGN_NAME="店诸葛"
SMS_TEMPLATE_CODE="SMS_12345678"
```

#### 9.1.2 数据库准备
```bash
# 1. 创建PostgreSQL数据库
CREATE DATABASE shopzhuge;

# 2. 执行数据库迁移(必须使用migrate，禁止db push)
npx prisma migrate deploy

# 3. 初始化种子数据(创建管理员账户)
npm run db:seed
# 默认管理员: admin@admin.com / admin123
```

### 9.2 开发运行

#### 9.2.1 安装依赖
```bash
npm install
```

#### 9.2.2 启动开发服务器
```bash
npm run dev
# 访问: http://localhost:3000
```

#### 9.2.3 开发命令
```bash
# 启动开发服务器(Next.js 16 Turbopack)
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# ESLint检查
npm run lint

# 数据库种子脚本
npm run db:seed
```

### 9.3 数据库迁移

#### 9.3.1 Prisma迁移规则(重要!)
根据 [`.trae/rules/prisma.md`](file:///workspace/.trae/rules/prisma.md):

1. **严禁使用** `prisma db push` (为了保留完整的SQL迁移历史)
2. **本地修改数据库**:
   ```bash
   # 改完schema后，必须执行:
   npx prisma migrate dev --name <简短的修改说明>
   ```
3. **生产环境部署**:
   ```bash
   # 只能使用:
   npx prisma migrate deploy
   ```

#### 9.3.2 迁移历史
当前数据库迁移版本:
- `20260622050856_init`: 初始化数据库结构
- `20260622050900_del_tenant_productid`: 删除租户产品ID
- `20260622053000_add_unique_module_to_opening_decision_setting`: 添加模块唯一约束
- `20260622060000_add_info_to_opening_decision_setting`: 添加模块信息字段
- `20260622063000_add_tenant_module_permission`: 添加租户模块权限

### 9.4 生产部署

#### 9.4.1 构建生产版本
```bash
# 1. 设置生产环境变量
export NODE_ENV=production

# 2. 构建应用
npm run build

# 3. 执行数据库迁移
npx prisma migrate deploy

# 4. 启动生产服务器
npm start
```

#### 9.4.2 生产环境要求
- Node.js 18+
- PostgreSQL数据库
- AI服务API密钥
- 环境变量配置完整

#### 9.4.3 性能优化
- 启用Next.js静态生成(ISR)
- 使用Server Components减少客户端JS
- 启用Turbo pack构建优化
- 数据库连接池配置

### 9.5 功能模块访问

#### 9.5.1 用户权限与访问路径

| 角色 | 可访问路径 | 功能模块 |
|------|-----------|---------|
| **匿名用户** | `/`, `/login`, `/register` | 首页、登录、注册 |
| **USER** | `/dashboard`, `/plan`, `/settings` | 控制台、开店决策、设置 |
| **TENANTADMIN** | `/tenant/users`, 所有USER路径 | 租户用户管理 |
| **ADMIN** | `/admin`, `/admin/prompt-settings`, `/admin/tenants` | 管理后台、Prompt设置、租户管理 |

#### 9.5.2 9大功能模块路径

| 模块ID | 模块名称 | 访问路径 | 状态 |
|-------|---------|---------|-----|
| 1 | 开店决策与商业计划 | `/plan` | ✅ 已实现 |
| 2 | 经营数据与复盘 | `/review` | 🚧 待开发 |
| 3 | 内容创作与营销 | `/marketing` | 🚧 待开发 |
| 4 | 评论口碑与私域 | `/domain` | 🚧 待开发 |
| 5 | 平台运营与投流 | `/operation` | 🚧 待开发 |
| 6 | 财务库存人员管理 | `/finance` | 🚧 待开发 |
| 7 | 资源对接与服务履约 | `/resource` | 🚧 待开发 |
| 8 | 代运营工作台与客户管理 | `/agency` | 🚧 待开发 |
| 9 | 行业外部信息 | `/industry` | 🚧 待开发 |

---

## 10. 特殊说明与注意事项

### 10.1 Next.js 16 特殊性
根据 [`AGENTS.md`](file:///workspace/AGENTS.md):
- 这是**非标准Next.js版本**，有破坏性变更
- APIs、惯例、文件结构可能与训练数据不同
- **必须阅读** `node_modules/next/dist/docs/` 中的指南
- 注意废弃警告

### 10.2 Prisma开发规范
- 禁止使用 `prisma db push`
- 必须通过迁移脚本修改数据库
- 保留完整迁移历史

### 10.3 AI服务配置
- 支持双提供商切换(DeepSeek/Ark)
- 延迟初始化避免构建时依赖
- 流式响应支持SSE协议
- 上下文压缩算法优化对话历史

### 10.4 安全注意事项
- JWT Session策略
- bcrypt密码加密(10轮)
- 权限分层控制
- API路由认证检查

---

## 11. 开发团队注意事项

### 11.1 代码风格
- TypeScript严格模式
- 函数式组件(React 19)
- Tailwind CSS原子类
- Airbnb设计令牌

### 11.2 Git提交规范
- 功能开发: feature分支
- Bug修复: fix分支
- 禁止提交 `.env` 文件
- 迁移文件必须提交

### 11.3 测试策略
- API端点测试
- 认证流程测试
- AI调用测试(模拟响应)
- 权限控制测试

---

## 12. 附录

### 12.1 常见问题

**Q: 如何切换AI提供商?**
A: 修改环境变量 `AI_PROVIDER` 为 `deepseek` 或 `ark`

**Q: 如何添加新的开店决策模块?**
A: 
1. 在 `prisma/schema.prisma` 添加模块字段
2. 执行 `npx prisma migrate dev`
3. 在 `api/plan/route.ts` 的 `MODULE_OPTIONS` 添加映射
4. 在 `OpeningDecisionSetting` 表添加Prompt配置

**Q: 如何调试流式响应?**
A: 设置环境变量 `AI_STREAM_DEBUG=1`

### 12.2 相关文档
- [README.md](file:///workspace/README.md) - 项目说明
- [AGENTS.md](file:///workspace/AGENTS.md) - Agent规则
- [.trae/rules/prisma.md](file:///workspace/.trae/rules/prisma.md) - Prisma规则
- [.env.example](file:///workspace/.env.example) - 环境变量示例

---

**文档版本**: 1.0
**最后更新**: 2026-06-28
**维护者**: 开发团队
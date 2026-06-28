# 店诸葛 - 服务器部署安装手册

## 目录
1. [环境要求](#1-环境要求)
2. [服务器环境准备](#2-服务器环境准备)
3. [项目部署](#3-项目部署)
4. [数据库配置与迁移](#4-数据库配置与迁移)
5. [环境变量配置](#5-环境变量配置)
6. [服务启动与管理](#6-服务启动与管理)
7. [Nginx 反向代理配置](#7-nginx-反向代理配置)
8. [SSL证书配置](#8-ssl证书配置)
9. [防火墙配置](#9-防火墙配置)
10. [常见问题排查](#10-常见问题排查)
11. [系统监控与维护](#11-系统监控与维护)

---

## 1. 环境要求

### 1.1 系统要求
| 项目 | 最低要求 | 推荐配置 |
|------|---------|---------|
| **操作系统** | Ubuntu 20.04+ / CentOS 7+ | Ubuntu 22.04 LTS |
| **CPU** | 2 核 | 4 核及以上 |
| **内存** | 4 GB | 8 GB 及以上 |
| **硬盘** | 40 GB | 100 GB SSD |
| **带宽** | 5 Mbps | 10 Mbps 及以上 |

### 1.2 软件要求
| 软件 | 版本要求 | 说明 |
|------|---------|------|
| **Node.js** | >= 18.17.0 | 推荐 LTS 版本 (v20.x) |
| **npm** | >= 9.x | 随 Node.js 安装 |
| **PostgreSQL** | >= 14 | 推荐 15/16 |
| **Nginx** | >= 1.18 | 反向代理和静态资源 |
| **Git** | >= 2.x | 代码拉取 |
| **PM2** | >= 5.x | Node.js 进程管理 |

---

## 2. 服务器环境准备

### 2.1 系统更新

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2.2 安装 Node.js

#### 方式一：使用 NodeSource (推荐)

```bash
# Ubuntu/Debian - 安装 Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# CentOS/RHEL - 安装 Node.js 20 LTS
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

#### 方式二：使用 NVM (Node Version Manager)

```bash
# 安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载 shell
source ~/.bashrc

# 安装 Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20
```

#### 验证安装

```bash
node -v   # 应输出 v20.x.x
npm -v    # 应输出 10.x.x
```

### 2.3 安装 PostgreSQL

#### Ubuntu/Debian

```bash
# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 启动并设置开机自启
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### CentOS/RHEL

```bash
# 安装 PostgreSQL 15
sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo yum install -y postgresql15-server postgresql15-contrib

# 初始化数据库
sudo /usr/pgsql-15/bin/postgresql-15-setup initdb

# 启动并设置开机自启
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15
```

#### 创建数据库和用户

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 在 psql 中执行以下命令：
CREATE DATABASE shopzhuge;
CREATE USER shopzhuge WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE shopzhuge TO shopzhuge;
\c shopzhuge
GRANT ALL ON SCHEMA public TO shopzhuge;
CREATE SCHEMA IF NOT EXISTS shopzhuge AUTHORIZATION shopzhuge;
\q
```

> **注意**：请将 `your_strong_password` 替换为强密码。

#### 修改 PostgreSQL 配置 (可选，如需要远程连接)

```bash
# 编辑 pg_hba.conf (路径可能因版本而异)
sudo nano /etc/postgresql/14/main/pg_hba.conf

# 添加或修改以下行（允许密码认证）
# local   all             all                                     md5
# host    all             all             127.0.0.1/32            md5

# 重启 PostgreSQL
sudo systemctl restart postgresql
```

### 2.4 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install -y nginx

# CentOS/RHEL
sudo yum install -y nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.5 安装 Git

```bash
# Ubuntu/Debian
sudo apt install -y git

# CentOS/RHEL
sudo yum install -y git

# 验证
git --version
```

### 2.6 安装 PM2 (进程管理)

```bash
sudo npm install -g pm2

# 验证
pm2 -v

# 设置开机自启
pm2 startup
# 按照提示执行输出的命令
```

---

## 3. 项目部署

### 3.1 创建部署目录

```bash
# 创建应用目录
sudo mkdir -p /opt/shopzhuge
sudo chown $USER:$USER /opt/shopzhuge
cd /opt/shopzhuge
```

### 3.2 拉取代码

#### 方式一：使用 Git (推荐)

```bash
# 如果是私有仓库，需要配置 SSH Key 或使用 HTTPS + Token
git clone https://github.com/your-org/shop-zhuge-next.git .

# 切换到生产分支
git checkout main

# 后续更新代码
git pull origin main
```

#### 方式二：上传代码包

```bash
# 本地打包后上传到服务器
# scp shop-zhuge-next.zip user@server:/opt/shopzhuge/

# 解压
unzip shop-zhuge-next.zip
```

### 3.3 安装依赖

```bash
cd /opt/shopzhuge

# 安装生产依赖
npm ci --production

# 或者使用 npm install
npm install --production
```

> **说明**：`npm ci` 根据 `package-lock.json` 安装，版本更稳定，推荐生产环境使用。

---

## 4. 数据库配置与迁移

### 4.1 配置数据库连接

创建环境变量文件：

```bash
cd /opt/shopzhuge
cp .env.example .env
nano .env
```

配置数据库连接（参考第5节详细配置）：

```env
DATABASE_URL="postgresql://shopzhuge:your_strong_password@localhost:5432/shopzhuge?schema=shopzhuge"
```

### 4.2 执行数据库迁移

> **重要**：生产环境必须使用 `prisma migrate deploy`，严禁使用 `prisma db push`！

```bash
cd /opt/shopzhuge

# 执行数据库迁移
npx prisma migrate deploy

# 验证迁移结果
npx prisma migrate status
```

### 4.3 初始化种子数据

```bash
# 运行种子脚本，创建管理员账户
npm run db:seed
```

> **默认管理员账号**:
> - 邮箱：`admin@admin.com`
> - 密码：`admin123`
> 
> ⚠️ **重要**：部署后请立即修改默认管理员密码！

### 4.4 Prisma Client 生成

```bash
# 生成 Prisma Client (通常 npm install 时自动执行)
npx prisma generate
```

---

## 5. 环境变量配置

### 5.1 完整环境变量说明

复制 `.env.example` 为 `.env` 并根据实际情况修改：

```bash
cd /opt/shopzhuge
cp .env.example .env
nano .env
```

### 5.2 环境变量详解

#### 数据库配置
```env
# PostgreSQL 数据库连接字符串
# 格式: postgresql://用户名:密码@主机:端口/数据库名?schema=schema名
DATABASE_URL="postgresql://shopzhuge:your_strong_password@localhost:5432/shopzhuge?schema=shopzhuge"
```

#### NextAuth 配置
```env
# 应用的完整 URL（用于回调链接等）
NEXTAUTH_URL="https://your-domain.com"

# JWT 签名密钥（必须设置为强随机字符串！）
# 生成方式: openssl rand -hex 32
NEXTAUTH_SECRET="your-very-long-secret-key-here-please-change-in-production"
```

> **生成 NEXTAUTH_SECRET**:
> ```bash
> openssl rand -hex 32
> ```

#### AI 服务配置 (二选一)

**方式一：DeepSeek**
```env
AI_PROVIDER="deepseek"
AI_API_KEY="your-deepseek-api-key"
AI_BASE_URL="https://api.deepseek.com/v1"      # 可选，默认即可
AI_MODEL="deepseek-chat"                       # 可选，默认即可
```

**方式二：火山引擎 Ark**
```env
AI_PROVIDER="ark"
ARK_API_KEY="your-ark-api-key"
ARK_BASE_URL="https://ark.cn-beijing.volces.com/api/v3"
ARK_MODEL="doubao-pro-32k-2411"
ARK_EMBEDDING_MODEL="doubao-embedding-vision-250615"
ARK_TEXT_EMBEDDING_MODEL="doubao-embedding-text-250615"
```

#### 短信服务配置 (可选)
```env
SMS_PROVIDER="aliyun"
SMS_ACCESS_KEY_ID="your-access-key-id"
SMS_ACCESS_KEY_SECRET="your-access-key-secret"
SMS_SIGN_NAME="店诸葛"
SMS_TEMPLATE_CODE="SMS_12345678"
```

#### 其他可选配置
```env
# 开启流式响应调试日志
AI_STREAM_DEBUG="0"

# Node 环境
NODE_ENV="production"
```

### 5.3 环境变量安全

```bash
# 设置 .env 文件权限，仅所有者可读写
chmod 600 /opt/shopzhuge/.env

# 确认 .env 在 .gitignore 中（不应提交到版本控制）
grep ".env" /opt/shopzhuge/.gitignore
```

---

## 6. 服务启动与管理

### 6.1 构建生产版本

```bash
cd /opt/shopzhuge

# 构建 Next.js 应用
npm run build
```

构建成功后会生成 `.next` 目录。

### 6.2 使用 PM2 管理进程

#### 6.2.1 创建 PM2 配置文件

在项目根目录创建 `ecosystem.config.js`：

```bash
cd /opt/shopzhuge
nano ecosystem.config.js
```

写入以下内容：

```javascript
module.exports = {
  apps: [{
    name: 'shopzhuge',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    cwd: '/opt/shopzhuge',
    instances: 'max',        // 使用所有 CPU 核心
    exec_mode: 'cluster',    // 集群模式
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // 日志配置
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/opt/shopzhuge/logs/pm2-error.log',
    out_file: '/opt/shopzhuge/logs/pm2-out.log',
    merge_logs: true,
    // 重启策略
    max_memory_restart: '1G', // 内存超过 1G 自动重启
    autorestart: true,
    watch: false,             // 生产环境关闭 watch
    min_uptime: '10s',
    max_restarts: 10,
  }]
};
```

#### 6.2.2 创建日志目录

```bash
mkdir -p /opt/shopzhuge/logs
```

#### 6.2.3 启动应用

```bash
cd /opt/shopzhuge

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs shopzhuge

# 保存 PM2 进程列表（开机自启需要）
pm2 save
```

### 6.3 PM2 常用命令

```bash
# 查看所有应用状态
pm2 status

# 查看日志
pm2 logs shopzhuge           # 查看实时日志
pm2 logs shopzhuge --lines 200  # 查看最近 200 行
pm2 logs shopzhuge --err     # 只看错误日志

# 重启应用
pm2 restart shopzhuge
pm2 restart all

# 停止应用
pm2 stop shopzhuge
pm2 stop all

# 删除应用
pm2 delete shopzhuge

# 查看详细信息
pm2 show shopzhuge

# 监控资源使用
pm2 monit
```

### 6.4 更新部署流程

```bash
cd /opt/shopzhuge

# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖
npm ci --production

# 3. 执行数据库迁移
npx prisma migrate deploy

# 4. 重新构建
npm run build

# 5. 重启应用
pm2 restart shopzhuge

# 6. 确认启动成功
pm2 status
pm2 logs shopzhuge --lines 50
```

---

## 7. Nginx 反向代理配置

### 7.1 创建 Nginx 配置文件

```bash
sudo nano /etc/nginx/sites-available/shopzhuge
```

### 7.2 配置内容

```nginx
# HTTP 配置（自动跳转到 HTTPS）
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 证书路径（参考第 8 节配置）
    ssl_certificate /etc/nginx/ssl/shopzhuge.pem;
    ssl_certificate_key /etc/nginx/ssl/shopzhuge.key;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;

    # 客户端最大请求体
    client_max_body_size 100M;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    gzip_comp_level 6;

    # Next.js 静态资源缓存
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 7d;
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    # 公共静态资源
    location /public/ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }

    # favicon
    location = /favicon.ico {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
    }

    # 主应用反向代理
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE 流式响应配置
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;

        # WebSocket 支持（如需要）
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 访问日志
    access_log /var/log/nginx/shopzhuge-access.log;
    error_log /var/log/nginx/shopzhuge-error.log;
}
```

> **注意**：请将 `your-domain.com` 替换为实际域名。

### 7.3 启用配置并测试

```bash
# 创建软链接启用站点
sudo ln -s /etc/nginx/sites-available/shopzhuge /etc/nginx/sites-enabled/

# 测试配置是否正确
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
# 或
sudo nginx -s reload
```

### 7.4 验证

访问 `http://your-domain.com`，应自动跳转到 HTTPS 并显示网站。

---

## 8. SSL 证书配置

### 8.1 使用 Let's Encrypt 免费证书 (推荐)

#### 安装 Certbot

```bash
# Ubuntu/Debian
sudo apt install -y certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install -y certbot python3-certbot-nginx
```

#### 申请证书

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

按照提示操作，Certbot 会自动配置 Nginx。

#### 自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# Certbot 会自动配置定时任务，可通过以下命令查看
sudo systemctl list-timers | grep certbot
```

### 8.2 使用已有证书

如果已有证书文件，手动配置：

```bash
# 创建 SSL 证书目录
sudo mkdir -p /etc/nginx/ssl

# 上传证书文件
# 将证书文件和私钥文件上传到服务器

# 设置权限
sudo chmod 600 /etc/nginx/ssl/*
```

证书路径与 Nginx 配置对应：
- 证书文件：`/etc/nginx/ssl/shopzhuge.pem`
- 私钥文件：`/etc/nginx/ssl/shopzhuge.key`

---

## 9. 防火墙配置

### 9.1 UFW (Ubuntu/Debian)

```bash
# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### 9.2 Firewalld (CentOS/RHEL)

```bash
# 允许 HTTP/HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# 重载配置
sudo firewall-cmd --reload

# 查看状态
sudo firewall-cmd --list-all
```

### 9.3 PostgreSQL 访问控制

> **生产环境建议**：PostgreSQL 仅监听本地，不对外开放。

```bash
# 编辑 PostgreSQL 配置
sudo nano /etc/postgresql/14/main/postgresql.conf

# 确保只监听本地
listen_addresses = 'localhost'

# 重启 PostgreSQL
sudo systemctl restart postgresql
```

---

## 10. 常见问题排查

### 10.1 应用无法启动

#### 查看日志
```bash
# PM2 日志
pm2 logs shopzhuge --err

# 详细错误信息
pm2 show shopzhuge
```

#### 常见原因
1. **端口被占用**
   ```bash
   # 检查端口占用
   lsof -i :3000
   # 或
   netstat -tlnp | grep 3000
   ```

2. **依赖未安装**
   ```bash
   cd /opt/shopzhuge
   npm ci --production
   ```

3. **数据库连接失败**
   - 检查 `DATABASE_URL` 是否正确
   - 检查 PostgreSQL 是否启动
   - 测试数据库连接
     ```bash
     psql "postgresql://shopzhuge:password@localhost:5432/shopzhuge"
     ```

4. **环境变量缺失**
   - 确认 `.env` 文件存在且配置正确
   - 确认关键变量：`DATABASE_URL`, `NEXTAUTH_SECRET`, `AI_API_KEY`

### 10.2 构建失败

```bash
# 查看构建错误
npm run build 2>&1 | tee build.log
```

常见问题：
- **内存不足**：增加服务器内存或增加 swap
- **TypeScript 错误**：检查代码类型问题
- **Prisma Client 未生成**：执行 `npx prisma generate`

### 10.3 502 Bad Gateway

Nginx 无法连接到 Node.js 应用：
1. 确认应用是否在运行：`pm2 status`
2. 确认端口是否正确：`lsof -i :3000`
3. 查看 Nginx 错误日志：`sudo tail -f /var/log/nginx/shopzhuge-error.log`

### 10.4 AI 调用失败

1. **API Key 错误**
   - 检查 `.env` 中的 API Key 配置
   - 确认 AI 提供商是否正确

2. **网络问题**
   - 测试网络连通性：
     ```bash
     curl -I https://api.deepseek.com
     # 或
     curl -I https://ark.cn-beijing.volces.com
     ```

3. **额度不足**
   - 检查 AI 服务商控制台的余额/额度

4. **查看详细日志**
   ```bash
   pm2 logs shopzhuge | grep -i "大模型调用错误"
   ```

### 10.5 数据库迁移失败

```bash
# 查看迁移状态
npx prisma migrate status

# 查看迁移详情
npx prisma migrate diff
```

**注意**：生产环境严禁使用 `prisma db push`！

### 10.6 性能问题

- **高 CPU 占用**：增加 PM2 实例数，升级服务器配置
- **高内存占用**：检查内存泄漏，配置 `max_memory_restart`
- **响应慢**：启用缓存，优化数据库查询，使用 CDN

---

## 11. 系统监控与维护

### 11.1 日志管理

#### 应用日志
```bash
# PM2 日志位置
/opt/shopzhuge/logs/pm2-out.log
/opt/shopzhuge/logs/pm2-error.log

# 查看实时日志
pm2 logs shopzhuge
```

#### Nginx 日志
```bash
# 访问日志
/var/log/nginx/shopzhuge-access.log

# 错误日志
/var/log/nginx/shopzhuge-error.log
```

#### 日志轮转 (Logrotate)

创建 Logrotate 配置：

```bash
sudo nano /etc/logrotate.d/shopzhuge
```

写入：
```
/opt/shopzhuge/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 $USER $USER
    sharedscripts
    postrotate
        pm2 reloadLogs > /dev/null 2>&1 || true
    endscript
}
```

### 11.2 数据库备份

#### 手动备份
```bash
# 备份数据库
pg_dump -U shopzhuge -h localhost shopzhuge > /backup/shopzhuge_$(date +%Y%m%d).sql

# 压缩备份
gzip /backup/shopzhuge_$(date +%Y%m%d).sql
```

#### 自动备份 (Cron)

```bash
# 创建备份脚本
sudo nano /opt/shopzhuge/scripts/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="shopzhuge"
DB_USER="shopzhuge"
RETENTION_DAYS=30

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/${DB_NAME}_${DATE}.sql

# 压缩
gzip $BACKUP_DIR/${DB_NAME}_${DATE}.sql

# 删除旧备份
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: ${DB_NAME}_${DATE}.sql.gz"
```

```bash
# 设置执行权限
chmod +x /opt/shopzhuge/scripts/backup.sh

# 添加到 crontab（每天凌晨 2 点备份）
crontab -e
# 添加：
# 0 2 * * * /opt/shopzhuge/scripts/backup.sh >> /opt/shopzhuge/logs/backup.log 2>&1
```

### 11.3 系统监控

#### PM2 监控
```bash
# 实时监控
pm2 monit
```

#### 系统资源监控
```bash
# CPU/内存
top
# 或
htop

# 磁盘
df -h

# 网络
iftop
```

### 11.4 定期维护清单

| 频率 | 任务 | 命令/说明 |
|------|-----|----------|
| **每日** | 检查系统状态 | `pm2 status`, 查看错误日志 |
| **每日** | 检查磁盘空间 | `df -h` |
| **每周** | 检查备份有效性 | 验证备份文件是否可恢复 |
| **每周** | 系统安全更新 | `apt update && apt list --upgradable` |
| **每月** | 清理旧日志 | Logrotate 自动处理 |
| **每月** | 性能优化分析 | 分析慢查询，优化热点 |
| **每季度** | 安全审计 | 检查安全更新，审计用户权限 |

---

## 附录 A：快速部署脚本

### 一键部署脚本 (Ubuntu 22.04)

将以下脚本保存为 `deploy.sh` 并执行：

```bash
#!/bin/bash
set -e

echo "=== 店诸葛部署脚本 ==="

# 配置变量
DOMAIN="your-domain.com"
DB_PASSWORD="your_db_password"
NEXTAUTH_SECRET=$(openssl rand -hex 32)
AI_API_KEY="your_ai_api_key"
PROJECT_DIR="/opt/shopzhuge"
REPO_URL="https://github.com/your-org/shop-zhuge-next.git"

echo "[1/10] 更新系统..."
apt update && apt upgrade -y

echo "[2/10] 安装 Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "[3/10] 安装 PostgreSQL..."
apt install -y postgresql postgresql-contrib

echo "[4/10] 配置数据库..."
sudo -u postgres psql <<EOF
CREATE DATABASE shopzhuge;
CREATE USER shopzhuge WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE shopzhuge TO shopzhuge;
\c shopzhuge
GRANT ALL ON SCHEMA public TO shopzhuge;
CREATE SCHEMA IF NOT EXISTS shopzhuge AUTHORIZATION shopzhuge;
EOF

echo "[5/10] 安装 Nginx 和 PM2..."
apt install -y nginx git
npm install -g pm2

echo "[6/10] 拉取代码..."
mkdir -p $PROJECT_DIR
git clone $REPO_URL $PROJECT_DIR
cd $PROJECT_DIR

echo "[7/10] 安装依赖和构建..."
npm ci --production
npx prisma generate
npm run build

echo "[8/10] 配置环境变量..."
cat > .env <<EOF
DATABASE_URL="postgresql://shopzhuge:$DB_PASSWORD@localhost:5432/shopzhuge?schema=shopzhuge"
NEXTAUTH_URL="https://$DOMAIN"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
AI_PROVIDER="deepseek"
AI_API_KEY="$AI_API_KEY"
NODE_ENV="production"
EOF
chmod 600 .env

echo "[9/10] 数据库迁移和种子数据..."
npx prisma migrate deploy
npm run db:seed

echo "[10/10] 启动应用..."
mkdir -p logs
pm2 start npm --name "shopzhuge" -- start
pm2 save
pm2 startup

echo ""
echo "=== 部署完成 ==="
echo "请配置 Nginx 和 SSL 证书（参考第7、8节）"
echo "默认管理员：admin@admin.com / admin123"
echo "请立即修改默认密码！"
```

---

## 附录 B：端口与服务清单

| 服务 | 端口 | 对外暴露 | 说明 |
|------|-----|---------|------|
| SSH | 22 | 是 (限制IP) | 远程登录 |
| Nginx HTTP | 80 | 是 | Web 服务 |
| Nginx HTTPS | 443 | 是 | Web 服务 (SSL) |
| Next.js | 3000 | 否 (仅本地) | Node.js 应用 |
| PostgreSQL | 5432 | 否 (仅本地) | 数据库 |

---

**文档版本**: 1.0
**最后更新**: 2026-06-28
**适用项目**: 店诸葛 (ShopZhuge) v0.1.0

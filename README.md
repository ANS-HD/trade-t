# TradingAgents-CN React

本项目使用 Docker Compose 统一运行以下服务：

- `frontend`：React 前端和 Nginx 反向代理
- `backend`：FastAPI 后端，容器内端口为 `8000`
- `mongodb`：业务数据存储
- `redis`：缓存和任务队列

前端是唯一对宿主机开放端口的服务。浏览器请求 `/api/*` 时，Nginx 会将请求转发给后端，因此正常使用时不需要单独开放后端的 `8000` 端口。

## 一、运行要求

- Docker Desktop（macOS/Windows），或 Docker Engine + Docker Compose Plugin（Linux）
- 建议至少 2 GB 可用内存
- 一个可用的大模型 API Key，例如 DeepSeek

确认 Docker 已启动：

```bash
docker version
docker compose version
```

## 二、首次配置

进入项目目录：

```bash
cd /path/to/TradingAgents-CN-React
```

如果还没有 `.env`，复制个人配置模板：

```bash
cp .env.personal.example .env
```

编辑 `.env`，至少完成以下配置：

```dotenv
TZ=Asia/Shanghai

# 仅供本机访问；部署到服务器时可改为 0.0.0.0
WEB_BIND=127.0.0.1
WEB_PORT=8080

# 请分别设置不同的强密码
MONGODB_USERNAME=admin
MONGODB_PASSWORD=请替换为随机密码
MONGODB_DATABASE=tradingagents
REDIS_PASSWORD=请替换为随机密码
JWT_SECRET=请替换为至少32位随机字符串
CSRF_SECRET=请替换为至少32位随机字符串

# 首次启动时自动创建的管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=请替换为管理员密码
ADMIN_EMAIL=admin@localhost.local

# DeepSeek
DEEPSEEK_API_KEY=请填写DeepSeek密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_ENABLED=true

# A股默认使用 AKShare，无需密钥
DEFAULT_CHINA_DATA_SOURCE=akshare

# 低配置服务器建议保持并发为 1
DEFAULT_USER_CONCURRENT_LIMIT=1
GLOBAL_CONCURRENT_LIMIT=1
```

可以使用以下命令生成随机字符串，每个密码或 Secret 应分别生成一次：

```bash
openssl rand -hex 24
```

不要提交包含真实密码和 API Key 的 `.env` 文件。

## 三、启动全部服务

首次启动，或者修改了代码、依赖、Dockerfile 后，执行：

```bash
docker compose up -d --build
```

首次构建需要下载前后端依赖，可能耗时数分钟。该命令会一次性启动前端、后端、MongoDB 和 Redis。

以后没有修改镜像相关内容时，可直接启动：

```bash
docker compose up -d
```

检查状态：

```bash
docker compose ps
```

等待四个服务均显示 `Up`，带健康检查的服务应显示 `healthy`。后端首次启动可能需要约 1～2 分钟。

## 四、访问和登录

如果使用上面的本地配置，打开：

- Web 页面：http://127.0.0.1:8080
- 后端健康检查：http://127.0.0.1:8080/api/health

登录账号使用 `.env` 中配置的：

- 用户名：`ADMIN_USERNAME`
- 密码：`ADMIN_PASSWORD`

管理员只会在数据库中不存在时自动创建。修改 `.env` 中的管理员密码不会自动修改已存在账号的密码。

命令行检查后端：

```bash
curl http://127.0.0.1:8080/api/health
```

## 五、查看日志

查看全部服务日志：

```bash
docker compose logs -f
```

只查看前端和后端：

```bash
docker compose logs -f frontend backend
```

只查看后端：

```bash
docker compose logs -f backend
```

按 `Ctrl+C` 只会退出日志查看，不会停止服务。

## 六、停止和重新启动

停止并删除容器，但保留数据库和应用数据：

```bash
docker compose down
```

重新启动全部服务：

```bash
docker compose restart
```

修改 `.env` 后需要重新创建容器：

```bash
docker compose up -d --force-recreate
```

修改代码后重新构建：

```bash
docker compose up -d --build
```

不要随意执行 `docker compose down -v`，该命令会删除 MongoDB、Redis 和应用数据卷。

## 七、按服务启动

通常建议启动全部服务。如果只需要启动后端及其依赖：

```bash
docker compose up -d mongodb redis backend
```

随后启动前端：

```bash
docker compose up -d frontend
```

后端的 `8000` 端口默认只在 Docker 网络内可见。对宿主机的 API 请求应使用：

```text
http://127.0.0.1:8080/api/...
```

## 八、DeepSeek 配置检查

确认 `.env` 中同时满足：

```dotenv
DEEPSEEK_API_KEY=有效的API密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_ENABLED=true
```

修改后重新创建容器：

```bash
docker compose up -d --force-recreate backend
docker compose restart frontend
```

检查后端是否读到配置，但不输出完整密钥：

```bash
docker compose exec backend python -c "import os; key=os.getenv('DEEPSEEK_API_KEY',''); print('enabled=', os.getenv('DEEPSEEK_ENABLED')); print('key_configured=', bool(key), 'key_length=', len(key))"
```

登录系统后，进入“系统设置 → 基础设置”，在“高级 JSON 编辑”中保留其他配置，并将默认模型字段设置为：

```json
{
  "quick_analysis_model": "deepseek-chat",
  "deep_analysis_model": "deepseek-chat"
}
```

点击“保存设置”。“系统设置 → 模型与数据源”页面目前用于查看供应商、模型和启用状态，不提供直接编辑功能。

## 九、常见问题

### 页面打不开

检查 Docker 和服务状态：

```bash
docker compose ps
docker compose logs --tail=100 frontend backend
```

确认访问端口与 `.env` 中的 `WEB_PORT` 一致。如果设置为 `WEB_PORT=8080`，访问地址就是 `http://127.0.0.1:8080`。

### 后端不健康

```bash
docker compose logs --tail=200 backend
docker compose restart backend
```

MongoDB 和 Redis 必须先健康，后端才会启动。

### 修改配置没有生效

单纯执行 `docker compose restart` 不会重新读取所有 Compose 环境变量。修改 `.env` 后请执行：

```bash
docker compose up -d --force-recreate
```

### 端口被占用

修改 `.env`：

```dotenv
WEB_PORT=8081
```

然后重新创建前端容器：

```bash
docker compose up -d --force-recreate frontend
```

新地址为 `http://127.0.0.1:8081`。

## 十、服务器部署提示

部署到服务器时可将：

```dotenv
WEB_BIND=0.0.0.0
WEB_PORT=80
```

同时应配置防火墙、HTTPS 反向代理和强密码。MongoDB、Redis与后端端口无需直接暴露到公网。

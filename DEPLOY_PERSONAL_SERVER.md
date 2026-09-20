# 个人服务器部署指南（React 版）

这个副本使用 React + Ant Design + TypeScript 前端、FastAPI 后端、MongoDB 和 Redis。生产入口只有一个 HTTP 端口，API 由前端 Nginx 同源反向代理；MongoDB、Redis 和 FastAPI 均不直接暴露到公网。

## 1. 服务器要求

- Linux x86_64 或 arm64
- Docker Engine 24+ 与 Docker Compose v2
- 建议至少 2 GB 内存、2 GB Swap 和 30 GB 可用磁盘
- 1 GB 内存 + 1 GB Swap 可用于低流量个人体验，但分析速度较慢，且必须保持并发为 1
- 低配镜像默认不安装 Pandoc 和 wkhtmltopdf，因此 Word/PDF 导出不可用，Markdown 导出不受影响

## 2. 准备配置

```bash
cd TradingAgents-CN-React
cp .env.personal.example .env
openssl rand -hex 24
```

编辑 `.env`，至少替换 `MONGODB_PASSWORD`、`REDIS_PASSWORD`、`JWT_SECRET`、`CSRF_SECRET`、`ADMIN_PASSWORD`，并配置至少一个大模型 API Key，把对应的 `*_ENABLED` 改为 `true`。

密码若包含 `@`、`:`、`/`、`?`、`#` 等 URI 特殊字符，需要 URL 编码。最省事的方式是只使用 `openssl rand -hex` 生成的十六进制字符串。

## 3. 构建并启动

```bash
docker compose config
docker compose build
docker compose up -d
docker compose ps
```

默认访问 `http://服务器IP/`。如果 80 端口已占用，在 `.env` 中把 `WEB_PORT` 改为其他端口，例如 `8080`。

首次启动后使用 `.env` 中的 `ADMIN_USERNAME / ADMIN_PASSWORD` 登录，并立即修改密码。管理员只会在首次启动、数据库中不存在同名用户时创建，后续修改 `.env` 不会重置已有密码。

## 4. 验证

```bash
curl -fsS http://127.0.0.1:${WEB_PORT:-80}/health
curl -fsS http://127.0.0.1:${WEB_PORT:-80}/api/health
docker compose logs --tail=100 backend
```

两个健康检查都应成功。首次构建后端镜像需要下载较多 Python 依赖，耗时会明显长于前端。1 GB 服务器直接构建可能触发 OOM，更稳妥的方式是在本地构建镜像后再上传。

## 5. HTTPS 与域名

推荐使用 Caddy、Nginx Proxy Manager 或现有反向代理，把域名的 HTTPS 流量转发到 `127.0.0.1:${WEB_PORT}`。防火墙只开放 80/443，不要开放 8000、27017 或 6379。

Caddy 示例：

```caddyfile
trading.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

如需让应用端口只监听本机，把 `.env` 中的 `WEB_BIND` 改为 `127.0.0.1`。

## 6. 更新与备份

```bash
docker compose build
docker compose up -d
docker image prune -f
```

重要数据位于 `tradingagents_mongodb_data`、`tradingagents_redis_data`、`tradingagents_app_data` 和 `tradingagents_app_logs` 四个 Docker volumes。

升级或迁移前备份 MongoDB：

```bash
docker compose exec mongodb sh -lc 'mongodump --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --archive=/tmp/tradingagents.archive --gzip'
docker compose cp mongodb:/tmp/tradingagents.archive ./tradingagents.archive
```

停止服务但保留数据使用 `docker compose down`。不要执行 `docker compose down -v`，除非确定要永久删除全部数据库和缓存卷。

## 7. 常用排障

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose restart backend
```

- 后端长期不健康：检查 MongoDB/Redis 密码，以及 `.env` 是否存在。
- 分析任务失败：检查至少一个 LLM 是否启用、API Key 是否有效、服务器能否访问对应模型接口。
- A 股数据为空：在“数据同步”页面执行基础数据同步。
- 内存不足：保持 `MEMORY_ENABLED=false`、降低并发，并为服务器配置 swap。

## 8. 上传前可清理的内容

以下都是可重建或与生产运行无关的内容，可在备份后删除：

- `frontend/node_modules/`：本地 npm 依赖，镜像构建时会通过 `npm ci` 重建
- `frontend/dist/`：前端构建产物，镜像构建时会重建
- `error.log*`、`logs/`、`**/__pycache__/`：日志和 Python 缓存
- `tests/`、`docs/`、`examples/`、`frontend-vue-reference/`：生产容器不使用
- `.git/`：只有在服务器不需要 `git pull` 更新时才可删除

不要删除 `config/`，也不要删除 Docker volumes 中的 MongoDB、Redis 和应用数据。

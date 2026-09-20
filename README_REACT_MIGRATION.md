# TradingAgents-CN React 迁移版

本目录是原项目的独立副本。原 Vue 源码保留在 `frontend-vue-reference/` 仅用于迁移核对；生产构建通过 `.dockerignore` 排除该目录。

## 主要变化

- 前端：Vue 3 / Element Plus / Pinia 改为 React 18 / Ant Design 5 / TypeScript / Zustand
- 路由：迁移为 React Router，保留原主要 URL
- API：统一 Axios 鉴权、错误提示和响应解包
- 部署：Nginx 同源代理 FastAPI，只公开一个 Web 端口
- 安全：数据库与 Redis 不再公开端口，密码和 JWT 密钥从 `.env` 注入
- 后端：保留 FastAPI 分析核心和现有业务服务，移除镜像内固定 `.env`，避免激进删减引发功能回归

## 本地前端开发

后端先运行在 `http://localhost:8000`，然后：

```bash
cd frontend
npm install
npm run dev
```

Vite 会把 `/api` 代理到本地 FastAPI。

## 生产部署

请阅读 [DEPLOY_PERSONAL_SERVER.md](./DEPLOY_PERSONAL_SERVER.md)。

## 已迁移页面

- 登录与响应式后台布局
- 仪表板
- 单股分析、批量分析、任务中心
- 股票筛选、自选股
- 股票详情、学习中心
- 报告列表、报告详情和导出
- 模拟交易
- 系统设置、模型和数据源
- 数据库、缓存、数据同步、调度、操作日志、系统日志、使用统计
- 关于与 404

论文 PDF 和核心插图仍保留在 `frontend/public/assets/`。

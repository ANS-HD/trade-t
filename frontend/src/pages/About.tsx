import { Card, Col, Divider, Row, Space, Tag, Typography } from 'antd'
import PageHeader from '@/components/PageHeader'

export default function About() {
  return (
    <>
      <PageHeader title="关于 TradingAgents-CN" description="面向中文用户的多智能体股票分析学习平台。" />
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={15}><Card className="page-card"><Typography.Title level={3}>项目说明</Typography.Title><Typography.Paragraph>系统让基本面、技术面、新闻、社交情绪、研究员、交易员和风险管理智能体协作完成股票分析。当前副本的前端已迁移到 React、Ant Design 与 TypeScript，后端继续使用 FastAPI。</Typography.Paragraph><Divider /><Typography.Title level={4}>技术栈</Typography.Title><Space wrap><Tag color="blue">React 18</Tag><Tag color="blue">TypeScript</Tag><Tag color="geekblue">Ant Design 5</Tag><Tag color="cyan">Vite</Tag><Tag color="green">FastAPI</Tag><Tag color="green">MongoDB</Tag><Tag color="red">Redis</Tag><Tag>Docker Compose</Tag></Space><Divider /><Typography.Paragraph type="warning">本项目只用于学习、研究和技术交流。AI 生成的观点可能错误或过时，不构成投资建议。</Typography.Paragraph></Card></Col>
        <Col xs={24} lg={9}><Card className="page-card"><img src="/about-illustration.svg" alt="about" style={{ width: '100%', maxHeight: 300 }} /><Typography.Title level={4}>React 迁移版</Typography.Title><Typography.Paragraph type="secondary">前端框架已替换；业务 API 和 Python 分析引擎保持兼容，方便继续升级原项目后端。</Typography.Paragraph></Card></Col>
      </Row>
    </>
  )
}

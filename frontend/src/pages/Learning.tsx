import { ArrowLeftOutlined, BookOutlined, RobotOutlined, SafetyOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Button, Card, Col, Divider, Row, Space, Tag, Typography } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'

const articles = {
  ai: { title: 'AI 与大语言模型基础', icon: <RobotOutlined />, tags: ['LLM', '基础'], content: '大语言模型通过大量文本训练学习语言规律。它善于总结、推理和生成内容，但并不天然拥有实时市场信息，也可能产生看似合理但错误的结论。股票分析系统需要把模型能力与可信数据、可追踪流程和风险约束结合起来。' },
  agents: { title: '多智能体如何协作分析', icon: <ThunderboltOutlined />, tags: ['Agents', '架构'], content: 'TradingAgents 将任务拆给市场、基本面、新闻和情绪分析智能体，再由多空研究员辩论、交易员形成计划、风险管理智能体复核。角色分工能扩大分析视角，但最终质量仍取决于输入数据、提示词、模型能力和校验机制。' },
  prompting: { title: '金融分析提示词方法', icon: <BookOutlined />, tags: ['提示词', '实践'], content: '高质量提示词应明确市场、日期、数据口径、分析目标、输出结构和风险边界。要求模型区分事实与推断、列出证据时间、说明未知项，并避免把历史相关性描述成确定因果。' },
  risk: { title: '理解 AI 投资分析的风险', icon: <SafetyOutlined />, tags: ['风险', '必读'], content: '模型可能引用过期行情、误读财报、忽略公司行动或放大新闻噪声。任何结论都应与原始公告、可信行情源和自身风险承受能力交叉验证。本平台用于学习研究，不构成投资建议。' }
} as const

export default function Learning({ article = false }: { article?: boolean }) {
  const navigate = useNavigate()
  const params = useParams()
  const id = (params.id || params.name || params.category || 'ai').replace(/\.md$/, '')
  const item = articles[id as keyof typeof articles]
  if (article || params.category) {
    const current = item || articles.ai
    return <div className="report-content"><PageHeader title={current.title} description="TradingAgents-CN 学习中心" extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/learning')}>返回</Button>} /><Card className="page-card"><Space>{current.tags.map((tag) => <Tag color="blue" key={tag}>{tag}</Tag>)}</Space><Divider /><Typography.Paragraph style={{ fontSize: 16, lineHeight: 2, whiteSpace: 'pre-wrap' }}>{current.content}</Typography.Paragraph><Divider /><Typography.Title level={4}>实践建议</Typography.Title><Typography.Paragraph>在分析页尝试不同研究深度和智能体组合，对比报告结构、证据质量和 Token 消耗。保存每次假设，并在之后用真实数据复盘。</Typography.Paragraph></Card></div>
  }
  return <><PageHeader title="AI 股票分析学习中心" description="了解模型、智能体、提示词与风险边界。" /><Row gutter={[16, 16]}>{Object.entries(articles).map(([key, value]) => <Col xs={24} md={12} key={key}><Card className="page-card" hoverable onClick={() => navigate(`/learning/article/${key}`)}><Space align="start" size="large"><Typography.Title level={2} style={{ color: '#1677ff', margin: 0 }}>{value.icon}</Typography.Title><div><Typography.Title level={4}>{value.title}</Typography.Title><Space>{value.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</Space><Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>{value.content.slice(0, 74)}…</Typography.Paragraph></div></Space></Card></Col>)}</Row></>
}

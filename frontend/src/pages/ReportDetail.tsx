import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons'
import { Button, Card, Col, Descriptions, Divider, Empty, Row, Skeleton, Space, Statistic, Tag, Typography } from 'antd'
import { reportsApi } from '@/api/services'
import type { Report } from '@/types'
import PageHeader from '@/components/PageHeader'

const labels: Record<string, string> = {
  summary: '分析摘要', recommendation: '投资观点', technical_analysis: '技术面分析', fundamental_analysis: '基本面分析',
  sentiment_analysis: '情绪分析', news_analysis: '新闻分析', risk_assessment: '风险评估', market_report: '市场分析',
  fundamentals_report: '基本面报告', sentiment_report: '情绪报告', news_report: '新闻报告', investment_plan: '投资计划', trader_investment_plan: '交易计划'
}

const collectSections = (value: unknown, prefix = ''): Array<[string, string]> => {
  if (!value || typeof value !== 'object') return []
  return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => {
    const title = labels[key] || `${prefix}${key}`
    if (typeof item === 'string' && item.trim().length > 30) return [[title, item] as [string, string]]
    if (item && typeof item === 'object' && !Array.isArray(item)) return collectSections(item, `${title} / `)
    return []
  })
}

export default function ReportDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { reportsApi.detail(id).then(setReport).finally(() => setLoading(false)) }, [id])
  if (loading) return <Skeleton active />
  if (!report) return <Empty description="未找到报告" />
  const sections = collectSections(report)
  return (
    <div className="report-content">
      <PageHeader title={`${report.stock_name || ''} ${report.stock_code || report.stock_symbol || ''} 分析报告`} description={String(report.analysis_date || report.created_at || '')} extra={<Space><Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/reports')}>返回</Button><Button type="primary" icon={<DownloadOutlined />} onClick={async () => { const blob = await reportsApi.download(id); const url = URL.createObjectURL(blob); window.open(url); window.setTimeout(() => URL.revokeObjectURL(url), 1000) }}>导出</Button></Space>} />
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}><Card><Statistic title="综合评分" value={Number(report.overall_score || 0)} suffix="/ 100" /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="市场" value={String(report.market_type || '-')} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="研究深度" value={String(report.research_depth || '-')} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="建议" value={String(report.recommendation || '-').slice(0, 12)} /></Card></Col>
      </Row>
      <Card className="page-card" style={{ marginTop: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2 }} items={[
          { key: 'id', label: '报告 ID', children: id }, { key: 'symbol', label: '股票代码', children: String(report.stock_code || report.stock_symbol || '-') },
          { key: 'date', label: '分析日期', children: String(report.analysis_date || '-') }, { key: 'status', label: '状态', children: <Tag color="success">已完成</Tag> }
        ]} />
      </Card>
      {sections.length ? sections.map(([title, content], index) => <Card className="page-card" style={{ marginTop: 16 }} key={`${title}-${index}`}><Typography.Title level={3}>{title}</Typography.Title><Divider /><Typography.Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: 1.9 }}>{content}</Typography.Paragraph></Card>) : <Card style={{ marginTop: 16 }}><pre className="json-view">{JSON.stringify(report, null, 2)}</pre></Card>}
    </div>
  )
}

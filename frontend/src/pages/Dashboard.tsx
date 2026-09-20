import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightOutlined, BarChartOutlined, FileTextOutlined, HeartOutlined, SearchOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { Button, Card, Col, Empty, List, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { analysisApi, favoritesApi, reportsApi } from '@/api/services'
import type { Report, Task } from '@/types'
import StatusTag from '@/components/StatusTag'

const asArray = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) return value as Record<string, unknown>[]
  if (value && typeof value === 'object' && 'items' in value && Array.isArray((value as { items: unknown }).items)) return (value as { items: Record<string, unknown>[] }).items
  return []
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [favorites, setFavorites] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    Promise.allSettled([analysisApi.tasks({ limit: 6 }), reportsApi.list({ page: 1, page_size: 5 }), favoritesApi.list()]).then(([taskRes, reportRes, favRes]) => {
      if (taskRes.status === 'fulfilled') setTasks(Array.isArray(taskRes.value) ? taskRes.value : taskRes.value.tasks || taskRes.value.items || [])
      if (reportRes.status === 'fulfilled') setReports(reportRes.value.reports)
      if (favRes.status === 'fulfilled') setFavorites(asArray(favRes.value))
    })
  }, [])

  const running = tasks.filter((item) => ['pending', 'queued', 'running', 'processing'].includes(item.status)).length

  return (
    <>
      <section className="hero">
        <Typography.Title level={1}>多智能体股票分析工作台</Typography.Title>
        <p>整合基本面、技术面、新闻情绪与风险评估，让分析过程清晰、可追踪。</p>
        <Space wrap>
          <Button type="primary" size="large" icon={<BarChartOutlined />} onClick={() => navigate('/analysis/single')}>开始分析</Button>
          <Button size="large" icon={<SearchOutlined />} onClick={() => navigate('/screening')}>股票筛选</Button>
        </Space>
      </section>
      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}><Card className="metric-card"><Statistic title="近期任务" value={tasks.length} prefix={<UnorderedListOutlined />} /></Card></Col>
        <Col xs={12} lg={6}><Card className="metric-card"><Statistic title="执行中" value={running} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={12} lg={6}><Card className="metric-card"><Statistic title="分析报告" value={reports.length} prefix={<FileTextOutlined />} /></Card></Col>
        <Col xs={12} lg={6}><Card className="metric-card"><Statistic title="自选股票" value={favorites.length} prefix={<HeartOutlined />} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={16}>
          <Card className="page-card" title="最近任务" extra={<Button type="link" onClick={() => navigate('/tasks')}>全部任务 <ArrowRightOutlined /></Button>}>
            <Table<Task> rowKey="task_id" size="small" pagination={false} dataSource={tasks} scroll={{ x: 680 }} columns={[
              { title: '股票', render: (_, row) => row.stock_name ? `${row.stock_name} (${row.symbol || row.stock_code})` : row.symbol || row.stock_code || row.stock_symbol || '-' },
              { title: '状态', dataIndex: 'status', render: (value) => <StatusTag status={value} /> },
              { title: '进度', render: (_, row) => <Progress percent={row.progress || 0} size="small" style={{ minWidth: 110 }} /> },
              { title: '创建时间', render: (_, row) => row.created_at || row.start_time ? dayjs(row.created_at || row.start_time).format('MM-DD HH:mm') : '-' }
            ]} />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card className="page-card" title="我的自选" extra={<Button type="link" onClick={() => navigate('/favorites')}>管理</Button>}>
            {favorites.length ? <List dataSource={favorites.slice(0, 6)} renderItem={(item) => <List.Item onClick={() => navigate(`/analysis/single?symbol=${String(item.stock_code || '')}`)} style={{ cursor: 'pointer' }}>
              <List.Item.Meta title={`${String(item.stock_name || item.stock_code || '-')}`} description={String(item.stock_code || '')} />
              {item.change_percent != null && <Tag color={Number(item.change_percent) >= 0 ? 'red' : 'green'}>{Number(item.change_percent) >= 0 ? '+' : ''}{Number(item.change_percent).toFixed(2)}%</Tag>}
            </List.Item>} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无自选股" />}
          </Card>
        </Col>
      </Row>
    </>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { App, Button, Card, Col, Descriptions, Empty, Row, Space, Statistic, Switch, Table, Tag, Typography } from 'antd'
import { CloudSyncOutlined, DatabaseOutlined, ReloadOutlined } from '@ant-design/icons'
import { api, get, post, unwrap } from '@/api/client'
import PageHeader from '@/components/PageHeader'

type Data = Record<string, unknown>
type PageType = 'database' | 'operations' | 'logs' | 'sync' | 'cache' | 'usage' | 'scheduler'

const config: Record<PageType, { title: string; description: string; endpoints: string[] }> = {
  database: { title: '数据库管理', description: '查看 MongoDB / Redis 连接与集合统计。', endpoints: ['/api/system/database/status', '/api/system/database/stats'] },
  operations: { title: '操作日志', description: '查看登录、配置和分析相关审计记录。', endpoints: ['/api/system/logs/list?page=1&page_size=100', '/api/system/logs/stats'] },
  logs: { title: '系统日志', description: '查看个人服务器上的后端日志文件与统计。', endpoints: ['/api/system/system-logs/files', '/api/system/system-logs/statistics'] },
  sync: { title: '数据同步', description: '查看行情数据源和最近一次基础数据同步状态。', endpoints: ['/api/sync/multi-source/sources/status', '/api/sync/stock_basics/status'] },
  cache: { title: '缓存管理', description: '查看磁盘缓存占用并清理过期数据。', endpoints: ['/api/cache/stats', '/api/cache/backend-info', '/api/cache/details?page=1&page_size=100'] },
  usage: { title: '使用统计', description: '统计模型 Token、调用次数和费用。', endpoints: ['/api/usage/statistics?days=30', '/api/usage/records?limit=100'] },
  scheduler: { title: '定时任务', description: '查看、暂停或立即触发后端定时任务。', endpoints: ['/api/scheduler/jobs', '/api/scheduler/stats'] }
}

const findRows = (values: unknown[]): Data[] => {
  for (const value of values) {
    if (Array.isArray(value)) return value as Data[]
    if (value && typeof value === 'object') {
      for (const candidate of Object.values(value as Data)) if (Array.isArray(candidate)) return candidate as Data[]
    }
  }
  return []
}

const display = (value: unknown): string => {
  if (value == null) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default function SystemPage({ type }: { type: PageType }) {
  const { modal, message } = App.useApp()
  const page = config[type]
  const [values, setValues] = useState<unknown[]>([])
  const [loading, setLoading] = useState(false)
  const load = useCallback(async () => {
    setLoading(true)
    try { setValues(await Promise.all(page.endpoints.map((url) => get<unknown>(url)))) } finally { setLoading(false) }
  }, [page])
  useEffect(() => { void load() }, [load])
  const rows = findRows(values)
  const columns = useMemo(() => Object.keys(rows[0] || {}).filter((key) => !['details', 'metadata'].includes(key)).slice(0, 8).map((key) => ({ title: key, dataIndex: key, ellipsis: true, render: (value: unknown) => typeof value === 'boolean' ? <Tag color={value ? 'success' : 'default'}>{value ? '是' : '否'}</Tag> : display(value) })), [rows])

  const triggerSync = async () => { await post('/api/sync/stock_basics/run?force=false'); message.success('同步任务已启动'); await load() }
  const cleanCache = () => modal.confirm({ title: '清理 7 天前的缓存？', onOk: async () => { unwrap((await api.delete('/api/cache/cleanup?days=7')).data); message.success('缓存已清理'); await load() } })
  const testDatabase = async () => { await post('/api/system/database/test'); message.success('连接测试完成'); await load() }
  const jobAction = async (row: Data, action: 'pause' | 'resume' | 'trigger') => { await post(`/api/scheduler/jobs/${String(row.id || row.job_id)}/${action}`); message.success('操作成功'); await load() }

  const extra = <Space>
    {type === 'database' && <Button icon={<DatabaseOutlined />} onClick={testDatabase}>测试连接</Button>}
    {type === 'sync' && <Button type="primary" icon={<CloudSyncOutlined />} onClick={triggerSync}>同步基础数据</Button>}
    {type === 'cache' && <Button danger onClick={cleanCache}>清理过期缓存</Button>}
    <Button icon={<ReloadOutlined />} loading={loading} onClick={load}>刷新</Button>
  </Space>

  return (
    <>
      <PageHeader title={page.title} description={page.description} extra={extra} />
      {type === 'scheduler' && rows.length > 0 ? <Card className="page-card"><Table<Data> rowKey={(row, index) => String(row.id || row.job_id || index)} dataSource={rows} columns={[
        { title: '任务', render: (_, row) => <><Typography.Text strong>{display(row.display_name || row.name || row.id)}</Typography.Text><br /><Typography.Text type="secondary">{display(row.id || row.job_id)}</Typography.Text></> },
        { title: '下次执行', render: (_, row) => display(row.next_run_time || row.next_run) }, { title: '状态', render: (_, row) => <Tag color={row.paused || row.enabled === false ? 'default' : 'success'}>{row.paused || row.enabled === false ? '已暂停' : '运行中'}</Tag> },
        { title: '操作', render: (_, row) => <Space><Switch checked={!(row.paused || row.enabled === false)} onChange={(checked) => jobAction(row, checked ? 'resume' : 'pause')} /><Button type="link" onClick={() => jobAction(row, 'trigger')}>立即运行</Button></Space> }
      ]} /></Card> : <>
        <Row gutter={[16, 16]}>
          {values.map((value, index) => <Col xs={24} lg={values.length > 1 ? 12 : 24} key={page.endpoints[index]}><Card className="page-card" title={page.endpoints[index]}>
            {value && typeof value === 'object' && !Array.isArray(value) ? <Descriptions column={1} size="small" items={Object.entries(value as Data).filter(([, item]) => !Array.isArray(item)).slice(0, 14).map(([key, item]) => ({ key, label: key, children: display(item) }))} /> : Array.isArray(value) ? <Statistic title="记录数" value={value.length} /> : <Typography.Text>{display(value)}</Typography.Text>}
          </Card></Col>)}
        </Row>
        {rows.length > 0 ? <Card className="page-card" title="详细记录" style={{ marginTop: 16 }}><Table<Data> rowKey={(_, index) => String(index)} dataSource={rows} columns={columns} scroll={{ x: 900 }} /></Card> : !loading && <Card style={{ marginTop: 16 }}><Empty description="暂无明细记录" /></Card>}
      </>}
    </>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeleteOutlined, DownloadOutlined, EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, Select, Space, Table, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { reportsApi } from '@/api/services'
import type { Report } from '@/types'
import PageHeader from '@/components/PageHeader'

const reportId = (row: Report) => String(row.id || row.analysis_id || row.task_id || '')

export default function Reports() {
  const { modal, message } = App.useApp()
  const navigate = useNavigate()
  const [rows, setRows] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState<Record<string, unknown>>({ page: 1, page_size: 20 })

  const load = async (next = query) => {
    setLoading(true)
    try { const result = await reportsApi.list(next); setRows(result.reports); setTotal(result.total) } finally { setLoading(false) }
  }
  useEffect(() => { void load(query) }, [query])

  const download = async (row: Report) => {
    const blob = await reportsApi.download(reportId(row))
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a'); link.href = url; link.download = `${row.stock_name || row.stock_code || 'report'}.pdf`; link.click(); URL.revokeObjectURL(url)
  }
  const remove = (row: Report) => modal.confirm({ title: '删除报告？', okType: 'danger', onOk: async () => { await reportsApi.remove(reportId(row)); message.success('报告已删除'); await load() } })

  return (
    <>
      <PageHeader title="分析报告" description="检索、阅读和导出历史分析结果。" extra={<Button icon={<ReloadOutlined />} onClick={() => load()}>刷新</Button>} />
      <Card className="page-card">
        <Form layout="inline" onFinish={(values) => setQuery({ ...query, ...values, page: 1 })} style={{ marginBottom: 18, rowGap: 10 }}>
          <Form.Item name="search_keyword"><Input allowClear prefix={<SearchOutlined />} placeholder="股票代码或关键词" /></Form.Item>
          <Form.Item name="market_filter"><Select allowClear placeholder="市场" style={{ width: 130 }} options={[{ value: 'A股' }, { value: '港股' }, { value: '美股' }]} /></Form.Item>
          <Button type="primary" htmlType="submit">查询</Button>
        </Form>
        <Table<Report> rowKey={reportId} loading={loading} dataSource={rows} pagination={{ total, current: Number(query.page), pageSize: Number(query.page_size), onChange: (page, page_size) => setQuery({ ...query, page, page_size }) }} scroll={{ x: 900 }} columns={[
          { title: '报告', render: (_, row) => <><Typography.Text strong>{String(row.title || `${row.stock_name || ''} ${row.stock_code || row.stock_symbol || ''}`)}</Typography.Text><br /><Typography.Text type="secondary">{reportId(row)}</Typography.Text></> },
          { title: '市场', dataIndex: 'market_type', render: (value) => <Tag>{String(value || '-')}</Tag> },
          { title: '研究深度', dataIndex: 'research_depth', render: (value) => String(value || '-') },
          { title: '创建时间', dataIndex: 'created_at', render: (value) => value ? dayjs(String(value)).format('YYYY-MM-DD HH:mm') : '-' },
          { title: '操作', fixed: 'right', render: (_, row) => <Space>
            <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/reports/view/${reportId(row)}`)}>查看</Button>
            <Button type="text" icon={<DownloadOutlined />} onClick={() => download(row)} />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(row)} />
          </Space> }
        ]} />
      </Card>
    </>
  )
}

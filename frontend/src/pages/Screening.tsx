import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Col, Form, InputNumber, Row, Select, Space, Table, Tag } from 'antd'
import { post } from '@/api/client'
import PageHeader from '@/components/PageHeader'

interface Values { market: string; peMin?: number; peMax?: number; pbMax?: number; roeMin?: number; changeMin?: number; changeMax?: number; limit: number }
type Stock = Record<string, unknown>

export default function Screening() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Stock[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const run = async (values: Values) => {
    const conditions: Array<{ field: string; operator: string; value: unknown }> = []
    if (values.peMin != null || values.peMax != null) conditions.push({ field: 'pe', operator: 'between', value: [values.peMin ?? 0, values.peMax ?? 9999] })
    if (values.pbMax != null) conditions.push({ field: 'pb', operator: '<=', value: values.pbMax })
    if (values.roeMin != null) conditions.push({ field: 'roe', operator: '>=', value: values.roeMin })
    if (values.changeMin != null || values.changeMax != null) conditions.push({ field: 'pct_chg', operator: 'between', value: [values.changeMin ?? -100, values.changeMax ?? 100] })
    setLoading(true)
    try {
      const result = await post<{ total: number; items: Stock[] }>('/api/screening/enhanced', { market: values.market, conditions, limit: values.limit, offset: 0, order_by: [{ field: 'total_mv', direction: 'desc' }], use_database_optimization: true })
      setRows(result.items || []); setTotal(result.total || 0)
    } finally { setLoading(false) }
  }
  return (
    <>
      <PageHeader title="股票筛选" description="按估值、盈利能力和涨跌幅筛选股票，结果可直接发起分析。" />
      <Card className="page-card" style={{ marginBottom: 16 }}>
        <Form<Values> layout="vertical" onFinish={run} initialValues={{ market: 'CN', limit: 50 }}>
          <Row gutter={16}>
            <Col xs={12} md={6}><Form.Item name="market" label="市场"><Select options={[{ value: 'CN', label: 'A股' }, { value: 'HK', label: '港股' }, { value: 'US', label: '美股' }]} /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="peMin" label="市盈率 ≥"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="peMax" label="市盈率 ≤"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="pbMax" label="市净率 ≤"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="roeMin" label="ROE ≥"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="changeMin" label="涨跌幅 ≥"><InputNumber style={{ width: '100%' }} suffix="%" /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="changeMax" label="涨跌幅 ≤"><InputNumber style={{ width: '100%' }} suffix="%" /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="limit" label="结果数量"><InputNumber min={1} max={500} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit" loading={loading}>开始筛选</Button>
        </Form>
      </Card>
      <Card className="page-card" title={`筛选结果（${total}）`}>
        <Table<Stock> rowKey={(row) => String(row.code || row.symbol)} loading={loading} dataSource={rows} scroll={{ x: 900 }} columns={[
          { title: '代码', render: (_, row) => String(row.code || row.symbol || '-') }, { title: '名称', dataIndex: 'name', render: String },
          { title: '行业', dataIndex: 'industry', render: (value) => <Tag>{String(value || '-')}</Tag> },
          { title: '最新价', render: (_, row) => String(row.close ?? row.price ?? '-') }, { title: '涨跌幅', dataIndex: 'pct_chg', render: (value) => value == null ? '-' : `${Number(value).toFixed(2)}%` },
          { title: 'PE', dataIndex: 'pe', render: (value) => value == null ? '-' : Number(value).toFixed(2) }, { title: 'PB', dataIndex: 'pb', render: (value) => value == null ? '-' : Number(value).toFixed(2) },
          { title: '操作', fixed: 'right', render: (_, row) => <Space><Button type="link" onClick={() => navigate(`/analysis/single?symbol=${String(row.code || row.symbol)}`)}>分析</Button></Space> }
        ]} />
      </Card>
    </>
  )
}

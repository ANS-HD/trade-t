import { useEffect, useState } from 'react'
import { App, Button, Card, Col, Form, Input, InputNumber, Radio, Row, Select, Space, Statistic, Table, Tabs, Tag } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { paperApi } from '@/api/services'
import PageHeader from '@/components/PageHeader'

type RowData = Record<string, unknown>

export default function PaperTrading() {
  const { modal, message } = App.useApp()
  const [account, setAccount] = useState<RowData>({})
  const [positions, setPositions] = useState<RowData[]>([])
  const [orders, setOrders] = useState<RowData[]>([])
  const [form] = Form.useForm()
  const load = async () => {
    const [acc, pos, ord] = await Promise.all([paperApi.account(), paperApi.positions(), paperApi.orders()])
    setAccount((acc.account || acc) as RowData); setPositions(pos.items || []); setOrders(ord.items || [])
  }
  useEffect(() => { void load() }, [])
  const cash = (account.cash || {}) as RowData
  const equity = (account.equity || {}) as RowData
  const place = async (values: RowData) => { await paperApi.order(values); message.success('订单已成交'); form.resetFields(['code', 'quantity']); await load() }
  return (
    <>
      <PageHeader title="模拟交易" description="使用虚拟资金验证分析观点，支持 A 股、港股和美股。" extra={<Space><Button icon={<ReloadOutlined />} onClick={load}>刷新</Button><Button danger onClick={() => modal.confirm({ title: '重置模拟账户？', content: '持仓和订单将全部清空。', okType: 'danger', onOk: async () => { await paperApi.reset(); await load() } })}>重置账户</Button></Space>} />
      <Row gutter={[16, 16]}>
        {['CNY', 'HKD', 'USD'].map((currency) => <Col xs={24} md={8} key={currency}><Card><Statistic title={`${currency} 总资产`} value={Number(equity[currency] || cash[currency] || 0)} precision={2} /><div style={{ marginTop: 8 }}>可用资金：{Number(cash[currency] || 0).toLocaleString()}</div></Card></Col>)}
      </Row>
      <Card className="page-card" title="快捷下单" style={{ marginTop: 16 }}>
        <Form form={form} layout="inline" onFinish={place} initialValues={{ market: 'CN', side: 'buy' }} style={{ rowGap: 12 }}>
          <Form.Item name="market" label="市场"><Select style={{ width: 110 }} options={[{ value: 'CN', label: 'A股' }, { value: 'HK', label: '港股' }, { value: 'US', label: '美股' }]} /></Form.Item>
          <Form.Item name="code" label="代码" rules={[{ required: true }]}><Input style={{ width: 140 }} /></Form.Item>
          <Form.Item name="side" label="方向"><Radio.Group optionType="button" options={[{ value: 'buy', label: '买入' }, { value: 'sell', label: '卖出' }]} /></Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item>
          <Button type="primary" htmlType="submit">提交市价单</Button>
        </Form>
      </Card>
      <Card className="page-card" style={{ marginTop: 16 }}>
        <Tabs items={[
          { key: 'positions', label: `持仓（${positions.length}）`, children: <Table<RowData> rowKey={(row) => String(row.code)} dataSource={positions} scroll={{ x: 800 }} columns={[
            { title: '代码', dataIndex: 'code', render: String }, { title: '市场', dataIndex: 'market', render: (v) => <Tag>{String(v)}</Tag> }, { title: '数量', dataIndex: 'quantity', render: String },
            { title: '成本价', dataIndex: 'avg_cost', render: (v) => Number(v || 0).toFixed(2) }, { title: '最新价', dataIndex: 'last_price', render: (v) => v == null ? '-' : Number(v).toFixed(2) },
            { title: '市值', dataIndex: 'market_value', render: (v) => Number(v || 0).toFixed(2) }, { title: '浮动盈亏', dataIndex: 'unrealized_pnl', render: (v) => v == null ? '-' : Number(v).toFixed(2) }
          ]} /> },
          { key: 'orders', label: `订单（${orders.length}）`, children: <Table<RowData> rowKey={(row, index) => String(row.order_id || index)} dataSource={orders} scroll={{ x: 900 }} columns={[
            { title: '代码', dataIndex: 'code', render: String }, { title: '方向', dataIndex: 'side', render: (v) => <Tag color={v === 'buy' ? 'red' : 'green'}>{v === 'buy' ? '买入' : '卖出'}</Tag> },
            { title: '数量', dataIndex: 'quantity', render: String }, { title: '成交价', dataIndex: 'price', render: (v) => Number(v || 0).toFixed(2) }, { title: '金额', dataIndex: 'amount', render: (v) => Number(v || 0).toFixed(2) }, { title: '状态', dataIndex: 'status', render: String }
          ]} /> }
        ]} />
      </Card>
    </>
  )
}

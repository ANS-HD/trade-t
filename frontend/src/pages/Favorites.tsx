import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, Modal, Select, Space, Table, Tag } from 'antd'
import { favoritesApi } from '@/api/services'
import PageHeader from '@/components/PageHeader'

interface Favorite { stock_code: string; stock_name?: string; market?: string; current_price?: number; change_percent?: number; tags?: string[]; notes?: string }

export default function Favorites() {
  const { modal, message } = App.useApp()
  const navigate = useNavigate()
  const [rows, setRows] = useState<Favorite[]>([])
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const load = async () => { const value = await favoritesApi.list(); setRows((Array.isArray(value) ? value : value.items || []) as unknown as Favorite[]) }
  useEffect(() => { void load() }, [])
  const add = async (values: Favorite) => { await favoritesApi.add({ ...values, tags: [], notes: values.notes || '' }); message.success('已添加自选股'); setOpen(false); form.resetFields(); await load() }
  const remove = (row: Favorite) => modal.confirm({ title: `移除 ${row.stock_name || row.stock_code}？`, okType: 'danger', onOk: async () => { await favoritesApi.remove(row.stock_code); await load() } })
  return (
    <>
      <PageHeader title="我的自选股" description="维护关注列表并同步最新行情。" extra={<Space><Button icon={<ReloadOutlined />} onClick={async () => { await favoritesApi.sync(); await load() }}>同步行情</Button><Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>添加股票</Button></Space>} />
      <Card className="page-card"><Table<Favorite> rowKey="stock_code" dataSource={rows} scroll={{ x: 760 }} columns={[
        { title: '代码', dataIndex: 'stock_code' }, { title: '名称', dataIndex: 'stock_name' }, { title: '市场', dataIndex: 'market', render: (value) => <Tag>{value || '-'}</Tag> },
        { title: '最新价', dataIndex: 'current_price', render: (value) => value == null ? '-' : Number(value).toFixed(2) },
        { title: '涨跌幅', dataIndex: 'change_percent', render: (value) => value == null ? '-' : <Tag color={Number(value) >= 0 ? 'red' : 'green'}>{Number(value) >= 0 ? '+' : ''}{Number(value).toFixed(2)}%</Tag> },
        { title: '备注', dataIndex: 'notes', ellipsis: true },
        { title: '操作', render: (_, row) => <Space><Button type="link" onClick={() => navigate(`/analysis/single?symbol=${row.stock_code}`)}>分析</Button><Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(row)} /></Space> }
      ]} /></Card>
      <Modal title="添加自选股" open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={add} initialValues={{ market: 'A股' }}>
          <Form.Item name="stock_code" label="股票代码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="stock_name" label="股票名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="market" label="市场"><Select options={[{ value: 'A股' }, { value: '港股' }, { value: '美股' }]} /></Form.Item>
          <Form.Item name="notes" label="备注"><Input.TextArea /></Form.Item>
        </Form>
      </Modal>
    </>
  )
}

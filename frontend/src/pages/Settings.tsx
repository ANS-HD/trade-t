import { useEffect, useState } from 'react'
import { App, Button, Card, Col, Descriptions, Form, Input, Row, Space, Switch, Table, Tabs, Tag, Typography } from 'antd'
import { ReloadOutlined, SaveOutlined } from '@ant-design/icons'
import { get, put } from '@/api/client'
import { rawGet } from '@/api/services'
import PageHeader from '@/components/PageHeader'

type Data = Record<string, unknown>

export default function Settings({ mode = 'basic' }: { mode?: 'basic' | 'config' }) {
  const { message } = App.useApp()
  const [settings, setSettings] = useState<Data>({})
  const [providers, setProviders] = useState<Data[]>([])
  const [sources, setSources] = useState<Data[]>([])
  const [editor, setEditor] = useState('{}')
  const [loading, setLoading] = useState(false)
  const load = async () => {
    setLoading(true)
    try {
      const [s, p, d] = await Promise.allSettled([get<Data>('/api/config/settings'), rawGet<Data[]>('/api/config/llm/providers'), rawGet<Data[]>('/api/config/datasource')])
      if (s.status === 'fulfilled') { setSettings(s.value); setEditor(JSON.stringify(s.value, null, 2)) }
      if (p.status === 'fulfilled') setProviders(p.value)
      if (d.status === 'fulfilled') setSources(d.value)
    } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  const save = async () => { const parsed = JSON.parse(editor) as Data; await put('/api/config/settings', parsed); message.success('设置已保存'); await load() }
  const toggleSource = async (row: Data, enabled: boolean) => { await put(`/api/config/datasource/${String(row.name || row.type)}`, { ...row, enabled }); await load() }
  const scalarSettings = Object.entries(settings).filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value)).slice(0, 12)
  return (
    <>
      <PageHeader title={mode === 'config' ? '模型与数据源' : '系统设置'} description="配置项由后端持久化；密钥字段只显示脱敏值。" extra={<Button icon={<ReloadOutlined />} loading={loading} onClick={load}>刷新</Button>} />
      {mode === 'basic' ? <Row gutter={[16, 16]}>
        <Col xs={24} xl={10}><Card className="page-card" title="当前配置概览"><Descriptions column={1} items={scalarSettings.map(([key, value]) => ({ key, label: key, children: typeof value === 'boolean' ? <Tag color={value ? 'success' : 'default'}>{value ? '启用' : '关闭'}</Tag> : String(value) }))} /></Card></Col>
        <Col xs={24} xl={14}><Card className="page-card" title="高级 JSON 编辑"><Typography.Paragraph type="secondary">适合批量修改。保存前会校验 JSON 格式，请勿把真实密钥粘贴到截图或日志中。</Typography.Paragraph><Input.TextArea value={editor} onChange={(event) => setEditor(event.target.value)} autoSize={{ minRows: 16, maxRows: 30 }} style={{ fontFamily: 'monospace' }} /><Button type="primary" icon={<SaveOutlined />} style={{ marginTop: 14 }} onClick={save}>保存设置</Button></Card></Col>
      </Row> : <Card className="page-card"><Tabs items={[
        { key: 'llm', label: `大模型供应商（${providers.length}）`, children: <Table<Data> rowKey={(row) => String(row.id || row.provider || row.name)} dataSource={providers} columns={[
          { title: '供应商', render: (_, row) => String(row.display_name || row.name || row.provider || '-') }, { title: '模型', render: (_, row) => String(row.model_name || row.default_model || '-') },
          { title: '状态', dataIndex: 'enabled', render: (value) => <Tag color={value ? 'success' : 'default'}>{value ? '已启用' : '未启用'}</Tag> }, { title: 'API 地址', render: (_, row) => String(row.base_url || row.api_base || '-') }
        ]} /> },
        { key: 'sources', label: `数据源（${sources.length}）`, children: <Table<Data> rowKey={(row) => String(row.name || row.type)} dataSource={sources} columns={[
          { title: '数据源', render: (_, row) => String(row.display_name || row.name || row.type || '-') }, { title: '优先级', dataIndex: 'priority', render: String },
          { title: '状态', render: (_, row) => <Switch checked={Boolean(row.enabled)} onChange={(checked) => toggleSource(row, checked)} /> }
        ]} /> }
      ]} /></Card>}
    </>
  )
}

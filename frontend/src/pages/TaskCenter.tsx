import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DeleteOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons'
import { App, Button, Card, Progress, Segmented, Space, Table, Tooltip, Typography } from 'antd'
import dayjs from 'dayjs'
import { analysisApi } from '@/api/services'
import type { Task } from '@/types'
import PageHeader from '@/components/PageHeader'
import StatusTag from '@/components/StatusTag'

export default function TaskCenter() {
  const { modal, message } = App.useApp()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const tab = params.get('tab') || 'all'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await analysisApi.tasks({ limit: 100, ...(tab !== 'all' ? { status: tab } : {}) })
      setTasks(Array.isArray(result) ? result : result.tasks || result.items || [])
    } finally { setLoading(false) }
  }, [tab])

  useEffect(() => {
    void load()
    const timer = window.setInterval(load, 8000)
    return () => window.clearInterval(timer)
  }, [load])

  const remove = (row: Task) => modal.confirm({ title: '删除任务？', content: '此操作不会删除已经生成的报告。', okType: 'danger', onOk: async () => { await analysisApi.remove(row.task_id); message.success('任务已删除'); await load() } })
  const cancel = async (row: Task) => { await analysisApi.cancel(row.task_id); message.success('已发送取消请求'); await load() }

  return (
    <>
      <PageHeader title="任务中心" description="查看分析状态、进度与错误信息。页面每 8 秒自动刷新。" extra={<Button icon={<ReloadOutlined />} loading={loading} onClick={load}>刷新</Button>} />
      <Card className="page-card">
        <Segmented value={tab} onChange={(value) => setParams(value === 'all' ? {} : { tab: String(value) })} options={[{ label: '全部', value: 'all' }, { label: '执行中', value: 'running' }, { label: '已完成', value: 'completed' }, { label: '失败', value: 'failed' }]} style={{ marginBottom: 18 }} />
        <Table<Task> rowKey="task_id" loading={loading} dataSource={tasks} scroll={{ x: 850 }} columns={[
          { title: '股票', render: (_, row) => <><Typography.Text strong>{row.stock_name || row.symbol || row.stock_code || row.stock_symbol || '-'}</Typography.Text><br /><Typography.Text type="secondary" copyable>{row.task_id}</Typography.Text></> },
          { title: '状态', dataIndex: 'status', render: (value) => <StatusTag status={value} /> },
          { title: '进度', width: 180, render: (_, row) => <Progress percent={row.progress || (row.status === 'completed' ? 100 : 0)} size="small" status={row.status === 'failed' ? 'exception' : undefined} /> },
          { title: '当前步骤', dataIndex: 'current_step', render: (value, row) => value || row.message || '-' },
          { title: '创建时间', render: (_, row) => row.created_at || row.start_time ? dayjs(row.created_at || row.start_time).format('YYYY-MM-DD HH:mm') : '-' },
          { title: '操作', fixed: 'right', render: (_, row) => <Space>
            {row.status === 'completed' && <Button type="link" onClick={() => navigate(`/reports/view/${row.task_id}`)}>报告</Button>}
            {['pending', 'queued', 'running', 'processing'].includes(row.status) && <Tooltip title="取消"><Button type="text" danger icon={<StopOutlined />} onClick={() => cancel(row)} /></Tooltip>}
            <Tooltip title="删除"><Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(row)} /></Tooltip>
          </Space> }
        ]} />
      </Card>
    </>
  )
}

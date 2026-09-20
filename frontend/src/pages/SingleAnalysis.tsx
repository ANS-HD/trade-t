import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Button, Card, Checkbox, Col, DatePicker, Form, Input, Progress, Radio, Row, Select, Space, Steps, Typography, message } from 'antd'
import { PlayCircleOutlined, UnorderedListOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { analysisApi, type AnalysisPayload } from '@/api/services'
import PageHeader from '@/components/PageHeader'
import StatusTag from '@/components/StatusTag'
import type { Task } from '@/types'

interface FormValues { symbol: string; market: string; date: Dayjs; depth: string; analysts: string[]; features: string[] }

export default function SingleAnalysis() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form] = Form.useForm<FormValues>()
  const [submitting, setSubmitting] = useState(false)
  const [task, setTask] = useState<Task | null>(null)
  const timer = useRef<number>()

  useEffect(() => () => window.clearInterval(timer.current), [])

  const poll = (id: string) => {
    window.clearInterval(timer.current)
    const run = async () => {
      try {
        const current = await analysisApi.status(id)
        setTask(current)
        if (['completed', 'failed', 'cancelled'].includes(current.status)) window.clearInterval(timer.current)
      } catch { window.clearInterval(timer.current) }
    }
    void run()
    timer.current = window.setInterval(run, 3000)
  }

  const submit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      const payload: AnalysisPayload = {
        symbol: values.symbol.trim().toUpperCase(),
        parameters: {
          market_type: values.market,
          analysis_date: values.date.format('YYYY-MM-DD'),
          research_depth: values.depth,
          selected_analysts: values.analysts,
          include_sentiment: values.features.includes('sentiment'),
          include_risk: values.features.includes('risk'),
          language: 'zh-CN'
        }
      }
      const result = await analysisApi.start(payload)
      setTask({ task_id: result.task_id, symbol: payload.symbol, status: 'pending', progress: 0 })
      poll(result.task_id)
      message.success('分析任务已提交')
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <PageHeader title="单股分析" description="选择市场、分析深度和智能体，提交后可实时查看任务进度。" extra={<Button icon={<UnorderedListOutlined />} onClick={() => navigate('/tasks')}>任务中心</Button>} />
      <Row gutter={[20, 20]}>
        <Col xs={24} xl={task ? 14 : 18}>
          <Card className="page-card">
            <Form<FormValues> form={form} layout="vertical" onFinish={submit} initialValues={{ symbol: params.get('symbol') || '', market: 'A股', date: dayjs(), depth: '标准', analysts: ['market', 'fundamentals', 'news', 'social'], features: ['sentiment', 'risk'] }}>
              <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item name="symbol" label="股票代码" rules={[{ required: true, message: '请输入股票代码' }]}><Input size="large" placeholder="A股 600519 / 港股 00700 / 美股 AAPL" /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="market" label="市场"><Select size="large" options={[{ value: 'A股' }, { value: '港股' }, { value: '美股' }]} /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="date" label="分析日期"><DatePicker size="large" style={{ width: '100%' }} allowClear={false} /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="depth" label="研究深度"><Radio.Group optionType="button" buttonStyle="solid" options={['快速', '标准', '深度']} /></Form.Item></Col>
              </Row>
              <Form.Item name="analysts" label="参与分析的智能体" rules={[{ required: true, message: '至少选择一个智能体' }]}>
                <Checkbox.Group options={[{ label: '市场技术面', value: 'market' }, { label: '基本面', value: 'fundamentals' }, { label: '新闻', value: 'news' }, { label: '社交情绪', value: 'social' }]} />
              </Form.Item>
              <Form.Item name="features" label="附加能力"><Checkbox.Group options={[{ label: '情绪分析', value: 'sentiment' }, { label: '风险评估', value: 'risk' }]} /></Form.Item>
              <Alert type="info" showIcon message="深度分析会消耗更多 Token，并需要更长时间。任务会在后台执行，离开本页不会中断。" style={{ marginBottom: 20 }} />
              <Button type="primary" htmlType="submit" size="large" icon={<PlayCircleOutlined />} loading={submitting}>提交分析</Button>
            </Form>
          </Card>
        </Col>
        {task && <Col xs={24} xl={10}>
          <Card className="page-card" title={<Space>任务进度 <StatusTag status={task.status} /></Space>}>
            <Typography.Title level={4}>{task.stock_name || task.symbol || task.stock_code}</Typography.Title>
            <Progress type="circle" percent={task.progress || (task.status === 'completed' ? 100 : 0)} status={task.status === 'failed' ? 'exception' : undefined} />
            <Steps direction="vertical" size="small" style={{ marginTop: 24 }} current={task.status === 'completed' ? 3 : task.status === 'running' ? 1 : 0} items={[
              { title: '创建任务' }, { title: task.current_step || '多智能体协作分析' }, { title: '生成交易观点' }, { title: '保存报告' }
            ]} />
            {task.status === 'completed' && <Button type="primary" block onClick={() => navigate(`/reports/view/${task.task_id}`)}>查看分析报告</Button>}
            {task.error_message && <Alert type="error" message={task.error_message} />}
          </Card>
        </Col>}
      </Row>
    </>
  )
}

import { Button, Card, Checkbox, Form, Input, Radio, Select, Space, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { analysisApi } from '@/api/services'
import PageHeader from '@/components/PageHeader'

interface Values { title: string; symbols: string; market: string; depth: string; analysts: string[] }

export default function BatchAnalysis() {
  const navigate = useNavigate()
  const submit = async (values: Values) => {
    const symbols = [...new Set(values.symbols.split(/[\s,，;；]+/).map((item) => item.trim().toUpperCase()).filter(Boolean))]
    if (!symbols.length || symbols.length > 10) return message.warning('请输入 1 到 10 个股票代码')
    const result = await analysisApi.batch({
      title: values.title,
      symbols,
      parameters: { market_type: values.market, analysis_date: new Date().toISOString().slice(0, 10), research_depth: values.depth, selected_analysts: values.analysts, include_sentiment: true, include_risk: true, language: 'zh-CN' }
    })
    message.success(`已提交 ${result.total_tasks || symbols.length} 个任务`)
    navigate('/tasks')
  }
  return (
    <>
      <PageHeader title="批量分析" description="一次提交最多 10 只股票，后端将并发执行独立分析任务。" />
      <Card className="page-card" style={{ maxWidth: 900 }}>
        <Form<Values> layout="vertical" onFinish={submit} initialValues={{ title: `批量分析 ${new Date().toLocaleDateString()}`, market: 'A股', depth: '快速', analysts: ['market', 'fundamentals', 'news'] }}>
          <Form.Item name="title" label="批次名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="symbols" label="股票代码" extra="使用空格、逗号或换行分隔，最多 10 只。" rules={[{ required: true }]}><Input.TextArea rows={6} placeholder={'600519, 000001\n300750'} /></Form.Item>
          <Space size="large" wrap>
            <Form.Item name="market" label="默认市场"><Select style={{ width: 140 }} options={[{ value: 'A股' }, { value: '港股' }, { value: '美股' }]} /></Form.Item>
            <Form.Item name="depth" label="研究深度"><Radio.Group options={['快速', '标准', '深度']} optionType="button" /></Form.Item>
          </Space>
          <Form.Item name="analysts" label="智能体"><Checkbox.Group options={[{ label: '市场', value: 'market' }, { label: '基本面', value: 'fundamentals' }, { label: '新闻', value: 'news' }, { label: '社交情绪', value: 'social' }]} /></Form.Item>
          <Typography.Paragraph type="secondary">批量任务会消耗较多模型额度，个人服务器建议先使用“快速”深度。</Typography.Paragraph>
          <Button type="primary" htmlType="submit" size="large">提交批量任务</Button>
        </Form>
      </Card>
    </>
  )
}

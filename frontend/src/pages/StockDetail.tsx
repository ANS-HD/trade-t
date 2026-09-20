import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined, BarChartOutlined, HeartOutlined } from '@ant-design/icons'
import { Button, Card, Col, Descriptions, Empty, Row, Space, Statistic, Tag, Typography } from 'antd'
import { rawGet } from '@/api/services'
import PageHeader from '@/components/PageHeader'

type Data = Record<string, unknown>
const show = (value: unknown) => value == null || value === '' ? '-' : typeof value === 'object' ? JSON.stringify(value) : String(value)

export default function StockDetail() {
  const { code = '' } = useParams()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<Data>({})
  const [fundamentals, setFundamentals] = useState<Data>({})
  const [news, setNews] = useState<Data[]>([])
  useEffect(() => {
    Promise.allSettled([rawGet<Data>(`/api/stocks/${code}/quote`), rawGet<Data>(`/api/stocks/${code}/fundamentals`), rawGet<Data | Data[]>(`/api/stocks/${code}/news`)]).then(([q, f, n]) => {
      if (q.status === 'fulfilled') setQuote(q.value)
      if (f.status === 'fulfilled') setFundamentals(f.value)
      if (n.status === 'fulfilled') setNews(Array.isArray(n.value) ? n.value : ((n.value.items || n.value.news || []) as Data[]))
    })
  }, [code])
  const change = Number(quote.change_percent || quote.pct_chg || 0)
  return <><PageHeader title={`${show(quote.name)}（${code}）`} description={show(quote.market)} extra={<Space><Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button><Button icon={<HeartOutlined />} onClick={() => navigate('/favorites')}>自选股</Button><Button type="primary" icon={<BarChartOutlined />} onClick={() => navigate(`/analysis/single?symbol=${code}`)}>开始分析</Button></Space>} />
    <Row gutter={[16, 16]}><Col xs={12} md={6}><Card><Statistic title="最新价" value={Number(quote.current_price || quote.price || quote.close || 0)} precision={2} /></Card></Col><Col xs={12} md={6}><Card><Statistic title="涨跌幅" value={change} suffix="%" precision={2} valueStyle={{ color: change >= 0 ? '#cf1322' : '#3f8600' }} /></Card></Col><Col xs={12} md={6}><Card><Statistic title="成交量" value={Number(quote.volume || 0)} /></Card></Col><Col xs={12} md={6}><Card><Statistic title="成交额" value={Number(quote.amount || 0)} /></Card></Col></Row>
    <Row gutter={[16, 16]} style={{ marginTop: 16 }}><Col xs={24} lg={14}><Card className="page-card" title="基本面"><Descriptions column={{ xs: 1, sm: 2 }} items={Object.entries(fundamentals).filter(([, value]) => typeof value !== 'object').slice(0, 20).map(([key, value]) => ({ key, label: key, children: show(value) }))} /></Card></Col><Col xs={24} lg={10}><Card className="page-card" title="相关新闻">{news.length ? news.slice(0, 10).map((item, index) => <Card size="small" key={index} style={{ marginBottom: 8 }}><Typography.Text strong>{show(item.title)}</Typography.Text><br /><Typography.Text type="secondary">{show(item.published_at || item.time)}</Typography.Text></Card>) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}</Card></Col></Row>
  </>
}

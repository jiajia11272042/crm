import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'umi';
import { Card, Descriptions, Radio, Input, Button, message, Table, Tag, Space, Select, Divider } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { getCategories, getApprovalDetail, submitApproval, getHistoryCategories } from '@/services/ant-design-pro/api';
const { TextArea } = Input;

interface ApprovalNode {
  key: string;
  stage: string;
  stepType: string;
  approver: string;
  result: string;
  time: string;
  comment: string;
  isCurrent: boolean;
  isPending: boolean;
}

const industryMap: Record<string, string> = {
  GAME_ACTION: '游戏 - 动作',
  GAME_ADVENTURE: '游戏 - 冒险',
  GAME_ARCADE: '游戏 - 街机',
  GAME_BOARD: '游戏 - 桌面',
  GAME_CARD: '游戏 - 卡牌',
  GAME_CASUAL: '游戏 - 休闲',
  GAME_EDUCATIONAL: '游戏 - 教育',
  GAME_MUSIC: '游戏 - 音乐',
  GAME_PUZZLE: '游戏 - 益智',
  GAME_RACING: '游戏 - 竞速',
  GAME_ROLE_PLAYING: '游戏 - 角色扮演',
  GAME_SIMULATION: '游戏 - 模拟',
  GAME_SPORTS: '游戏 - 体育',
  GAME_STRATEGY: '游戏 - 策略',
  APP_BUSINESS: '应用 - 商务',
  APP_EDUCATION: '应用 - 教育',
  APP_ENTERTAINMENT: '应用 - 娱乐',
  APP_FINANCE: '应用 - 金融',
  APP_HEALTH_AND_FITNESS: '应用 - 健康与健身',
  APP_LIFESTYLE: '应用 - 生活方式',
};

const countryMap: Record<string, string> = {
  CN: '中国',
  US: '美国',
  JP: '日本',
  KR: '韩国',
  GB: '英国',
  DE: '德国',
  FR: '法国',
  IN: '印度',
  RU: '俄罗斯',
  BR: '巴西',
};

const shelfStatusMap: Record<string, string> = {
  GA: 'GA 在架',
  GP: 'GP 在架',
  BOTH: '均在架',
};

const settlementMap: Record<string, string> = {
  CPS: 'CPS',
  CPA: 'CPA',
  CPE: 'CPE',
  CPP: 'CPP',
};

const approvalStatusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待提交', color: 'default' },
  in_progress: { text: '审批中', color: 'processing' },
  approved: { text: '审批通过', color: 'success' },
  rejected: { text: '审批驳回', color: 'error' },
};

const generateApprovalProcess = (item: any): ApprovalNode[] => {
  const existingSteps = item.approvalSteps || [];
  const category = item.category;
  const needLegalReview = category?.needLegalReview || false;
  const needRsaApproval = category?.needRsaApproval || false;
  
  const allSteps = [
    { stepType: 'category_review', stepName: '分类审核' },
    ...(needLegalReview ? [{ stepType: 'legal_review', stepName: '法务审核' }] : []),
    ...(needRsaApproval ? [
      { stepType: 'rsa_operation', stepName: 'RSA运营审核' },
      { stepType: 'rsa_business', stepName: 'RSA商务审核' },
      { stepType: 'rsa_legal', stepName: 'RSA法务审核' }
    ] : [])
  ];
  
  const stepMap = new Map(existingSteps.map((s: any) => [s.stepType, s]));
  
  const process: ApprovalNode[] = allSteps.map((stepConfig, index) => {
    const existingStep = stepMap.get(stepConfig.stepType);
    const status = existingStep?.status || 'pending';
    const isCurrent = !existingStep && index === existingSteps.length;
    
    return {
      key: `step_${index}`,
      stage: stepConfig.stepName,
      stepType: stepConfig.stepType,
      approver: existingStep?.reviewer?.name || existingStep?.reviewer?.username || '-',
      result: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : '',
      time: existingStep?.reviewedAt ? (() => {
        const d = new Date(existingStep.reviewedAt);
        return isNaN(d.getTime()) ? '' : d.toISOString().replace('T', ' ').substring(0, 19);
      })() : '',
      comment: existingStep?.reviewComment || '',
      isCurrent,
      isPending: status === 'pending' && !isCurrent,
    };
  });
  
  return process;
};

const ApprovalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<any>(null);
  const [approvalProcess, setApprovalProcess] = useState<ApprovalNode[]>([]);
  const [approvalResult, setApprovalResult] = useState<'approved' | 'rejected'>('approved');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [approvalCategoryId, setApprovalCategoryId] = useState<number | null>(null);
  const [historicalCategories, setHistoricalCategories] = useState<any[]>([]);

  useEffect(() => {
    if (!id) {
      console.error('No id provided');
      return;
    }
    const fetchData = async () => {
      try {
        console.log('Starting fetch for id:', id);
        const [catRes, detailRes] = await Promise.all([
          getCategories(),
          getApprovalDetail(Number(id))
        ]);
        
        console.log('Categories response:', catRes);
        console.log('Detail response:', detailRes);
        
        if (catRes.code === 200 && catRes.data) {
          setCategories(catRes.data);
        }
        
        if (detailRes.code === 200 && detailRes.data) {
          setDetail(detailRes.data);
          setApprovalProcess(generateApprovalProcess(detailRes.data));
          setApprovalCategoryId(detailRes.data.categoryId);
          
          if (detailRes.data.packageName) {
            const historyRes = await getHistoryCategories(detailRes.data.packageName);
            if (historyRes.code === 200 && historyRes.data) {
              setHistoricalCategories(historyRes.data);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        message.error('获取数据失败');
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    if (!detail) return;
    try {
      setLoading(true);
      const res = await submitApproval(detail.id, {
        action: approvalResult,
        comment,
        approvedCategoryId: approvalCategoryId,
      });
      if (res.code === 200) {
        message.success('审批成功');
        navigate('/product-audit/approval');
      } else {
        message.error(res.msg || '审批失败');
      }
    } catch (error) {
      message.error('审批失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '审批节点',
      dataIndex: 'stage',
      key: 'stage',
      width: 150,
      render: (text: string, record: ApprovalNode) => (
        <Space>
          {text}
          {record.isCurrent && <Tag color="processing">当前审批</Tag>}
          {record.isPending && record.result === '' && <Tag color="default">待审批</Tag>}
        </Space>
      ),
    },
    {
      title: '审批人',
      dataIndex: 'approver',
      key: 'approver',
      width: 120,
    },
    {
      title: '审批结果',
      dataIndex: 'result',
      key: 'result',
      width: 120,
      render: (text: string) => {
        if (!text) return '-';
        return text === 'approved' 
          ? <Tag color="success">通过</Tag> 
          : <Tag color="error">驳回</Tag>;
      },
    },
    {
      title: '审批时间',
      dataIndex: 'time',
      key: 'time',
      width: 180,
      render: (text: string) => text || '-',
    },
    {
      title: '审批意见',
      dataIndex: 'comment',
      key: 'comment',
      render: (text: string) => text || '-',
    },
  ];

  if (!detail) {
    return <div>加载中...</div>;
  }

  const targetCountriesList = detail.targetCountries ? detail.targetCountries.split(',') : [];
  const countryNames = targetCountriesList.map((c: string) => countryMap[c] || c).join('、') || '-';

  return (
    <div>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/product-audit/approval')} style={{ padding: 0, marginBottom: 16 }}>
        返回审批列表
      </Button>
      
      <Card title="产品信息">
        <Descriptions column={3} bordered>
          <Descriptions.Item label="包名">{detail.packageName}</Descriptions.Item>
          <Descriptions.Item label="分类">
            {detail.categoryId && categories.length > 0 ? (
              (() => {
                const cat = categories.length > 0 ? categories.find(c => c.id === detail.categoryId) : null;
                return cat ? (cat.nameEn ? `${cat.name} - ${cat.nameEn}` : cat.name) : '-';
              })()
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="开发者名称">{detail.developer}</Descriptions.Item>
          <Descriptions.Item label="包体大小">{detail.packageSize}</Descriptions.Item>
          <Descriptions.Item label="上架状态">{shelfStatusMap[detail.shelfStatus] || detail.shelfStatus}</Descriptions.Item>
          <Descriptions.Item label="结算方式">{settlementMap[detail.settlementMethod] || detail.settlementMethod}</Descriptions.Item>
          <Descriptions.Item label="GA 链接">{detail.gaLink || '-'}</Descriptions.Item>
          <Descriptions.Item label="GP 链接">{detail.gpLink || '-'}</Descriptions.Item>
          <Descriptions.Item label="GP 评分">{detail.gpRating || '-'}</Descriptions.Item>
          <Descriptions.Item label="归因窗口期">{detail.attributionWindow ? `${detail.attributionWindow} 天` : '-'}</Descriptions.Item>
          <Descriptions.Item label="投放目标国家">{countryNames}</Descriptions.Item>
          <Descriptions.Item label="提交人">{detail.submitter?.name || detail.submitter?.username || '-'}</Descriptions.Item>
          <Descriptions.Item label="提交时间">{detail.submitTime}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card 
        title={
          <span>
            审批进程 
            <Tag color={approvalStatusMap[detail.status]?.color} style={{ marginLeft: 8 }}>
              {approvalStatusMap[detail.status]?.text}
            </Tag>
          </span>
        }
        style={{ marginTop: 16 }}
      >
        <Table
          columns={columns}
          dataSource={approvalProcess}
          pagination={false}
          rowKey="key"
          rowClassName={(record) => record.isCurrent ? 'current-approval-row' : ''}
        />
        <style>{`
          .current-approval-row {
            background-color: #e6f7ff !important;
          }
          .current-approval-row:hover td {
            background-color: #bae7ff !important;
          }
        `}</style>
      </Card>

      <Card title="审批操作" style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontWeight: 'bold', marginRight: 16 }}>投放分类：</span>
          </div>
          <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
            {approvalCategoryId && categories.length > 0 ? (
              (() => {
                const cat = categories.length > 0 ? categories.find(c => c.id === approvalCategoryId) : null;
                return cat ? (cat.nameEn ? `${cat.name} - ${cat.nameEn}` : cat.name) : '-';
              })()
            ) : historicalCategories.length > 0 && categories.length > 0 ? (
              (() => {
                const latestCat = historicalCategories[0];
                const cat = categories.length > 0 ? categories.find(c => c.id === latestCat?.id) : null;
                return cat ? (cat.nameEn ? `${cat.name} - ${cat.nameEn}` : cat.name) : '-';
              })()
            ) : detail?.categoryId && categories.length > 0 ? (
              (() => {
                const cat = categories.length > 0 ? categories.find(c => c.id === detail.categoryId) : null;
                return cat ? (cat.nameEn ? `${cat.name} - ${cat.nameEn}` : cat.name) : '-';
              })()
            ) : '-'}
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontWeight: 'bold', marginRight: 16 }}>分类确认：</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 8, color: '#666' }}>用户提交分类：</div>
              {detail && (
                <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
                  {categories.length > 0 ? (
                    (() => {
                      const cat = categories.find(c => c.id === detail.categoryId);
                      return cat ? (cat.nameEn ? `${cat.name} - ${cat.nameEn}` : cat.name) : '-';
                    })()
                  ) : '-'}
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 8, color: '#666' }}>审批分类：</div>
              <Select
                style={{ width: '100%' }}
                value={approvalCategoryId}
                onChange={setApprovalCategoryId}
                placeholder="请选择审批分类"
                showSearch
                optionFilterProp="label"
                options={categories.length > 0 ? categories.map(cat => ({
                  value: cat.id,
                  label: cat.nameEn ? `${cat.name} - ${cat.nameEn}` : cat.name,
                })) : []}
              />
            </div>
          </div>
          {historicalCategories.length > 0 && categories.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 8, color: '#666' }}>历史审批通过的分类（点击替换）：</div>
              <Space split={<Divider type="vertical" />}>
                {historicalCategories.map(cat => (
                  <Button
                    key={cat.id}
                    type={approvalCategoryId === cat.id ? 'primary' : 'default'}
                    onClick={() => setApprovalCategoryId(cat.id)}
                  >
                    {cat.nameEn ? `${cat.name} - ${cat.nameEn}` : cat.name}
                    <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>{cat.lastApprovedTime}</span>
                  </Button>
                ))}
              </Space>
            </div>
          )}
        </div>
        <Divider />
        <div style={{ maxWidth: 400 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ marginRight: 16 }}>审批结果:</span>
            <Radio.Group value={approvalResult} onChange={(e) => setApprovalResult(e.target.value)}>
              <Radio value="approved">
                <CheckOutlined style={{ color: '#52c41a' }} /> 通过
              </Radio>
              <Radio value="rejected">
                <CloseOutlined style={{ color: '#ff4d4f' }} /> 驳回
              </Radio>
            </Radio.Group>
          </div>
          <div>
            <span style={{ marginRight: 16 }}>审批意见:</span>
            <TextArea
              rows={4}
              placeholder="请输入审批意见"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>
          <div style={{ marginTop: 24 }}>
            <Button type="primary" size="large" onClick={handleSubmit} loading={loading}>
              提交审批
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ApprovalDetail;

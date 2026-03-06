import React, { useState, useEffect } from 'react';
import { ProTable, ProDescriptions } from '@ant-design/pro-components';
import { Button, Modal, Tag, Table, message, Space } from 'antd';
import { EyeOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'umi';
import { getCategories, getProducts, getApprovals, getApprovalDetail, updateProduct } from '@/services/ant-design-pro/api';

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
  
  return allSteps.map((stepConfig, index) => {
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
};

// 审批状态映射
const approvalStatusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待提交', color: 'default' },
  in_progress: { text: '审批中', color: 'processing' },
  approved: { text: '审批通过', color: 'success' },
  rejected: { text: '审批驳回', color: 'error' },
};

// 审批结果映射
const approvalResultMap = {
  pending: { text: '待审批', color: 'default' },
  approved: { text: '通过', color: 'success' },
  rejected: { text: '驳回', color: 'error' },
};

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [approvalProcess, setApprovalProcess] = useState<ApprovalNode[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        if (res.code === 200 && res.data) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await getProducts({ page, pageSize: size });
      if (res.code === 200 && res.data) {
        setProducts(res.data.list || []);
        setTotal(res.data.total || 0);
        setCurrentPage(page);
        setPageSize(size);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {} as Record<number, any>);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '包名',
      dataIndex: 'packageName',
      key: 'packageName',
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId: number) => {
        const cat = categoryMap[categoryId];
        if (!cat) return '-';
        return cat.nameEn ? `${cat.name} - ${cat.nameEn}` : cat.name;
      },
    },
    {
      title: '开发者名称',
      dataIndex: 'developer',
      key: 'developer',
    },
    {
      title: '包体大小',
      dataIndex: 'packageSize',
      key: 'packageSize',
    },
    {
      title: '投放目标国家',
      dataIndex: 'targetCountries',
      key: 'targetCountries',
      render: (countries) => {
        if (!countries) return '-';
        if (Array.isArray(countries)) return countries.join(', ');
        return countries;
      },
    },
    {
      title: '上架状态',
      dataIndex: 'shelfStatus',
      key: 'shelfStatus',
      render: (status) => {
        switch (status) {
          case 'GA':
            return 'GA 在架';
          case 'GP':
            return 'GP 在架';
          case 'BOTH':
            return '均在架';
          default:
            return status;
        }
      },
    },
    {
      title: 'GP 评分',
      dataIndex: 'gpRating',
      key: 'gpRating',
    },
    {
      title: '归因窗口期',
      dataIndex: 'attributionWindow',
      key: 'attributionWindow',
      render: (days) => `${days} 天`,
    },
    {
      title: '结算方式',
      dataIndex: 'settlementMethod',
      key: 'settlementMethod',
    },
    {
      title: '提交人',
      dataIndex: 'submitterName',
      key: 'submitterName',
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      render: (time) => {
        if (!time) return '-';
        const date = new Date(time);
        if (isNaN(date.getTime())) return '-';
        return date.toISOString().replace('T', ' ').substring(0, 19);
      },
    },
    {
      title: '审批状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusInfo = approvalStatusMap[status] || { text: status || '-', color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        const showApprovalFlow = ['in_progress', 'approved', 'rejected'].includes(record.status);
        const canEdit = record.status === 'pending';
        return (
          <>
            {canEdit && (
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEditProduct(record)}
              >
                编辑
              </Button>
            )}
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewApprovalFlow(record)}
              disabled={!showApprovalFlow}
            >
              查看审批流
            </Button>
          </>
        );
      },
    },
  ];

  const handleViewApprovalFlow = async (product: any) => {
    try {
      const res = await getApprovalDetail(product.id);
      if (res.code === 200 && res.data) {
        const process = generateApprovalProcess(res.data);
        setApprovalProcess(process);
        setCurrentProduct(res.data);
        setApprovalModalVisible(true);
      }
    } catch (error) {
      console.error('Failed to fetch approval detail:', error);
      message.error('获取审批详情失败');
    }
  };

  const handleEditProduct = async (product: any) => {
    navigate('/product-audit/submit', { state: { product } });
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>产品列表</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/product-audit/submit')}>
          新增产品
        </Button>
      </div>
      <ProTable
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, size) => fetchProducts(page, size),
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={{
          reload: () => fetchProducts(currentPage, pageSize),
          density: true,
        }}
        params={{}}
        request={async (params = {}) => {
          const { current = 1, pageSize = 10, ...rest } = params;
          await fetchProducts(current, pageSize);
          return {
            data: products,
            success: true,
            total,
          };
        }}
      />
      <Modal
        title="审批流"
        open={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setApprovalModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={900}
      >
        {currentProduct && (
          <>
            <Table
              columns={[
                {
                  title: '审批节点',
                  dataIndex: 'stage',
                  key: 'stage',
                  width: 150,
                },
                {
                  title: '审批人',
                  dataIndex: 'approver',
                  key: 'approver',
                  width: 120,
                  render: (name: string) => name || '-',
                },
                {
                  title: '审批结果',
                  dataIndex: 'result',
                  key: 'result',
                  width: 120,
                  render: (result: string) => {
                    if (!result) return '-';
                    return result === 'approved' 
                      ? <Tag color="success">通过</Tag> 
                      : <Tag color="error">驳回</Tag>;
                  },
                },
                {
                  title: '审批时间',
                  dataIndex: 'time',
                  key: 'time',
                  width: 180,
                  render: (t: string) => t || '-',
                },
              ]}
              dataSource={approvalProcess}
              pagination={false}
              rowKey={(record: any) => record.key}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;
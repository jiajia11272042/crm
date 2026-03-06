import React, { useState, useEffect } from 'react';
import { ProTable, ProDescriptions } from '@ant-design/pro-components';
import { Button, Modal, Tag, Form, Select, Input, message } from 'antd';
import { useNavigate } from 'umi';
import { getCategories, getApprovals } from '@/services/ant-design-pro/api';
const { TextArea } = Input;
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';

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

const ApprovalList = () => {
  const navigate = useNavigate();
  const [approvalItems, setApprovalItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [form] = Form.useForm();
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

  const fetchApprovals = async (page = 1, size = 10, status?: string) => {
    setLoading(true);
    try {
      const params: any = { page, pageSize: size };
      if (status) {
        params.status = status;
      }
      const res = await getApprovals(params);
      if (res.code === 200 && res.data) {
        setApprovalItems(res.data.list || []);
        setTotal(res.data.total || 0);
        setCurrentPage(page);
        setPageSize(size);
      }
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {} as Record<number, any>);

  const columns = [
    {
      title: '审批ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '产品ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 80,
    },
    {
      title: '产品名称',
      dataIndex: ['product', 'name'],
      key: 'name',
      width: 150,
    },
    {
      title: '包名',
      dataIndex: ['product', 'packageName'],
      key: 'packageName',
      width: 180,
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 150,
      render: (_: any, record: any) => {
        const cat = record.category;
        if (!cat) return '-';
        return cat.nameEn ? `${cat.name} - ${cat.nameEn}` : cat.name;
      },
    },
    {
      title: '提交人',
      dataIndex: ['product', 'submitter', 'name'],
      key: 'submitter',
      width: 100,
      render: (_: any, record: any) => record.product?.submitter?.name || record.product?.submitter?.username || '-',
    },
    {
      title: '提交时间',
      dataIndex: ['product', 'submitTime'],
      key: 'submitTime',
      width: 160,
      render: (time: string) => time && typeof time === 'string' ? time.replace('T', ' ').substring(0, 19) : '-',
    },
    {
      title: '审批状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusInfo = approvalStatusMap[status] || { text: status || '-', color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <>
          <Button
            type="link"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record)}
          >
            审批
          </Button>
        </>
      ),
    },
  ];

  const handleApprove = (item: any) => {
    navigate(`/product-audit/approval/${item.productId}`);
  };

  const handleSubmitApproval = (values) => {
    try {
      // 模拟审批操作
      const updatedItems = approvalItems.map(item => {
        if (item.id === currentItem.id) {
          const updatedFlow = item.approvalFlow.map(flow => {
            if (flow.stage === item.currentStage) {
              return {
                ...flow,
                result: values.result,
                time: new Date().toLocaleString(),
                comment: values.comment,
              };
            }
            return flow;
          });
          
          let newStatus = item.approvalStatus;
          if (values.result === 'rejected') {
            newStatus = 'rejected';
          } else if (updatedFlow.every(flow => flow.result === 'approved')) {
            newStatus = 'approved';
          }
          
          return {
            ...item,
            approvalFlow: updatedFlow,
            approvalStatus: newStatus,
          };
        }
        return item;
      });
      
      setApprovalItems(updatedItems);
      message.success('审批成功');
      setApprovalModalVisible(false);
    } catch (error) {
      message.error('审批失败');
    }
  };

  return (
    <div>
      <h1>审批列表</h1>
      <ProTable
        columns={columns}
        dataSource={approvalItems}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, size) => fetchApprovals(page, size),
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={{
          reload: () => fetchApprovals(currentPage, pageSize),
          density: true,
        }}
        params={{}}
        request={async (params = {}) => {
          const { current = 1, pageSize = 10 } = params;
          await fetchApprovals(current, pageSize);
          return {
            data: approvalItems,
            success: true,
            total,
          };
        }}
      />
      <Modal
        title="审批"
        open={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        {currentItem && (
          <div>
            <ProDescriptions column={2}>
              <ProDescriptions.Item label="包名">{currentItem.packageName}</ProDescriptions.Item>
              <ProDescriptions.Item label="开发者">{currentItem.developer}</ProDescriptions.Item>
              <ProDescriptions.Item label="提交人">{currentItem.submitter}</ProDescriptions.Item>
              <ProDescriptions.Item label="提交时间">{currentItem.submitTime}</ProDescriptions.Item>
              <ProDescriptions.Item label="当前审批环节">{currentItem.currentStage}</ProDescriptions.Item>
            </ProDescriptions>
            <div style={{ marginTop: 24 }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmitApproval}
              >
                <Form.Item
                  name="result"
                  label="审批结果"
                  rules={[{ required: true, message: '请选择审批结果' }]}
                >
                  <Select
                    placeholder="请选择审批结果"
                    options={[
                      { value: 'approved', label: '通过' },
                      { value: 'rejected', label: '驳回' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  name="comment"
                  label="审批意见"
                  rules={[{ required: true, message: '请输入审批意见' }]}
                >
                  <TextArea rows={4} placeholder="请输入审批意见" />
                </Form.Item>
              </Form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApprovalList;
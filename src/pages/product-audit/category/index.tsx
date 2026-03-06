import React, { useState, useEffect } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Form, Input, Select, InputNumber, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { categoryService } from '../services';
import type { ProductCategory } from '../types';

const ProductCategoryList = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [form] = Form.useForm();

  // 初始化加载数据
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      message.error('加载产品分类失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '分类ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left',
    },
    {
      title: '分类名称（英文）',
      dataIndex: 'nameEn',
      key: 'nameEn',
      width: 180,
      fixed: 'left',
    },
    {
      title: '是否有白名单',
      dataIndex: 'hasWhitelist',
      key: 'hasWhitelist',
      width: 120,
      render: (text: any) => (text === true ? '是' : '否'),
      search: false,
    },
    {
      title: '需要法务审核',
      dataIndex: 'needLegalReview',
      key: 'needLegalReview',
      width: 120,
      render: (text: any) => (text === true ? '是' : '否'),
      search: false,
    },
    {
      title: '需要RSA审批',
      dataIndex: 'needRsaApproval',
      key: 'needRsaApproval',
      width: 120,
      render: (text: any) => (text === true ? '是' : '否'),
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
      render: (text: string) => {
        if (!text) return '-';
        return (
          <span title={text}>{text}</span>
        );
      },
      search: false,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
    },
    {
      title: () => (
        <span>
          创建时间 <InfoCircleOutlined title="此时间为0时区时间" />
        </span>
      ),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (text: string) => {
        if (!text) return '-';
        const match = text.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (match) {
          return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
        }
        return text;
      },
      search: false,
    },
    {
      title: '编辑人',
      dataIndex: 'editor',
      key: 'editor',
      width: 100,
      search: {
        inputProps: {
          maxLength: 20,
        },
      },
    },
    {
      title: '编辑时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 200,
      render: (text: string) => {
        if (!text) return '-';
        const match = text.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (match) {
          return (
            <span>
              <InfoCircleOutlined style={{ marginRight: 4 }} title="此时间为0时区时间" />
              {`${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`}
            </span>
          );
        }
        return text;
      },
      search: false,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: ProductCategory) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </>
      ),
      search: false,
    },
  ];

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: ProductCategory) => {
    setEditingCategory(record);
    // 确保布尔值字段被正确设置
    form.setFieldsValue({
      ...record,
      hasWhitelist: record.hasWhitelist === true,
      needLegalReview: record.needLegalReview === true,
      needRsaApproval: record.needRsaApproval === true,
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确定删除该分类吗？',
      content: '删除后将无法恢复',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          await categoryService.delete(id);
          message.success('删除成功');
          loadCategories();
        } catch (error) {
          message.error((error as Error).message || '删除失败');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      // 添加编辑人信息（模拟当前用户）
      const currentUser = 'admin';
      // 确保所有必需字段都有值
      const submitValues = {
        ...values,
        hasWhitelist: values.hasWhitelist === true,
        needLegalReview: values.needLegalReview === true,
        needRsaApproval: values.needRsaApproval === true,
        riskLevel: values.riskLevel || 1,
        editor: currentUser,
      };
      
      if (editingCategory) {
        // 编辑
        await categoryService.update(editingCategory.id, submitValues);
        message.success('编辑成功');
      } else {
        // 新增
        const createValues = {
          ...submitValues,
          creator: currentUser,
        };
        await categoryService.add(createValues);
        message.success('新增成功');
      }
      setModalVisible(false);
      form.resetFields();
      loadCategories();
    } catch (error) {
      message.error((error as Error).message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>产品分类管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增分类
        </Button>
      </div>
      <ProTable
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content', y: 400 }}
        search={{
          labelWidth: 'auto',
        }}
        options={{
          reload: true,
          density: true,
        }}
      />
      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="分类名称（中文）"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 50, message: '分类名称不超过50个字符' },
            ]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item
            name="nameEn"
            label="分类名称（英文）"
            rules={[
              { required: true, message: '请输入英文分类名称' },
              { max: 50, message: '英文分类名称不超过50个字符' },
            ]}
          >
            <Input placeholder="请输入英文分类名称" />
          </Form.Item>
          <Form.Item
            name="hasWhitelist"
            label="是否有白名单"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="needLegalReview"
            label="是否需要法务审核"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="needRsaApproval"
            label="是否需要RSA审批"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
            rules={[
              { max: 200, message: '备注最多200个字符' },
            ]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="请输入备注信息（最多200字）"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductCategoryList;
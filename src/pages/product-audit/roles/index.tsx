import React, { useState, useEffect } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { Card, Tag, message } from 'antd';
import { getRoles } from '@/services/ant-design-pro/api';

const RoleList = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles();
      if (res.code === 200) {
        setRoles(res.data);
      } else {
        message.error(res.msg || '加载角色失败');
      }
    } catch (error) {
      message.error('加载角色失败');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    let color = 'default';
    if (role === 'admin') color = 'red';
    else if (role === 'operator') color = 'blue';
    else if (role === 'category_admin') color = 'green';
    else if (role.includes('rsa')) color = 'orange';
    else if (role === 'localizer' || role === 'legal') color = 'purple';
    return color;
  };

  const columns = [
    {
      title: '记录ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户ID',
      dataIndex: ['user', 'id'],
      key: 'userId',
      width: 100,
    },
    {
      title: '用户名',
      dataIndex: ['user', 'username'],
      key: 'username',
      width: 150,
    },
    {
      title: '姓名',
      dataIndex: ['user', 'name'],
      key: 'name',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role: string) => {
        return (
          <Tag color={getRoleColor(role)}>
            {role}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: string) => {
        return time ? time.replace('T', ' ').substring(0, 19) : '-';
      },
    },
  ];

  return (
    <Card>
      <ProTable
        columns={columns}
        dataSource={roles}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />
    </Card>
  );
};

export default RoleList;

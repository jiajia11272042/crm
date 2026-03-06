import React, { useState, useEffect } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { Card, Tag, message } from 'antd';
import { getUsers } from '@/services/ant-design-pro/api';

const UserList = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      if (res.code === 200) {
        setUsers(res.data);
      } else {
        message.error(res.msg || '加载用户失败');
      }
    } catch (error) {
      message.error('加载用户失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 300,
      render: (roles: string[]) => {
        return roles?.map((role) => {
          let color = 'default';
          if (role === 'admin') color = 'red';
          else if (role === 'operator') color = 'blue';
          else if (role === 'category_admin') color = 'green';
          else if (role.includes('rsa')) color = 'orange';
          else if (role === 'localizer' || role === 'legal') color = 'purple';
          return (
            <Tag key={role} color={color}>
              {role}
            </Tag>
          );
        });
      },
    },
  ];

  return (
    <Card>
      <ProTable
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={false}
        scroll={{ x: 600 }}
      />
    </Card>
  );
};

export default UserList;

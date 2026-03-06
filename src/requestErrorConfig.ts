import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message } from 'antd';

export const errorConfig: RequestConfig = {
  errorHandler: (error: any) => {
    console.error('Request error:', error);
    if (error.response) {
      message.error(`服务器错误: ${error.response.status}`);
    } else if (error.request) {
      message.error('网络错误，请检查网络连接');
    } else {
      message.error('请求失败，请重试');
    }
  },
  requestInterceptors: [(config: RequestOptions) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }],
  responseInterceptors: [(response) => response],
};

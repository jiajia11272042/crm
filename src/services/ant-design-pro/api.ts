// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser() {
  return request<API.CurrentUser>('/api/auth/me', {
    method: 'GET',
  });
}

export async function getCategories() {
  return request<any>('/api/categories', {
    method: 'GET',
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin() {
  return request<Record<string, any>>('/api/auth/logout', {
    method: 'POST',
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams) {
  return request<any>('/api/auth/login', {
    method: 'POST',
    data: body,
  });
}

export async function getProducts(params?: any) {
  return request<any>('/api/products', {
    method: 'GET',
    params,
  });
}

export async function getProduct(id: number) {
  return request<any>(`/api/products/${id}`, {
    method: 'GET',
  });
}

export async function createProduct(data: any) {
  return request<any>('/api/products', {
    method: 'POST',
    data,
  });
}

export async function updateProduct(id: number, data: any) {
  return request<any>(`/api/products/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteProduct(id: number) {
  return request<any>(`/api/products/${id}`, {
    method: 'DELETE',
  });
}

export async function getApprovals(params?: any) {
  return request<any>('/api/approvals', {
    method: 'GET',
    params,
  });
}

export async function getApprovalDetail(productId: number) {
  return request<any>(`/api/approvals/${productId}`, {
    method: 'GET',
  });
}

export async function startApproval(productId: number) {
  return request<any>(`/api/approvals/${productId}/start`, {
    method: 'POST',
  });
}

export async function submitApproval(productId: number, data: any) {
  return request<any>(`/api/approvals/${productId}/approve`, {
    method: 'POST',
    data,
  });
}

export async function getHistoryCategories(packageName: string) {
  return request<any>('/api/approvals/history/categories', {
    method: 'GET',
    params: { packageName },
  });
}

export async function getUsers() {
  return request<any>('/api/users', {
    method: 'GET',
  });
}

export async function getRoles() {
  return request<any>('/api/users/roles', {
    method: 'GET',
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

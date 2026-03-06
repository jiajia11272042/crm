/**
 * 产品审核系统 - 工具函数
 */

import type { ProductCategory, ApprovalStatus } from '../types';
import { industryOptions, countryOptions } from '../services/mock';

/**
 * 获取行业中文名
 */
export const getIndustryLabel = (value: string): string => {
  const option = industryOptions.find(o => o.value === value);
  return option?.label || value;
};

/**
 * 获取国家中文名
 */
export const getCountryLabel = (code: string): string => {
  const option = countryOptions.find(o => o.value === code);
  return option?.label || code;
};

/**
 * 获取国家中文名列表
 */
export const getCountriesLabel = (codes: string[]): string => {
  return codes.map(code => getCountryLabel(code)).join(', ');
};

/**
 * 获取审批状态中文显示
 */
export const getApprovalStatusLabel = (status: ApprovalStatus | string): string => {
  const statusMap: Record<string, string> = {
    pending: '待提交',
    approving: '审批中',
    approved: '审批通过',
    rejected: '审批驳回',
  };
  return statusMap[status] || status;
};

/**
 * 获取审批状态颜色
 */
export const getApprovalStatusColor = (status: ApprovalStatus | string): string => {
  const colorMap: Record<string, string> = {
    pending: 'default',
    approving: 'processing',
    approved: 'success',
    rejected: 'error',
  };
  return colorMap[status] || 'default';
};

/**
 * 获取审批结果中文显示
 */
export const getApprovalResultLabel = (result: string): string => {
  const resultMap: Record<string, string> = {
    pending: '待审批',
    approved: '通过',
    rejected: '驳回',
  };
  return resultMap[result] || result;
};

/**
 * 获取审批结果颜色
 */
export const getApprovalResultColor = (result: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'default',
    approved: 'success',
    rejected: 'error',
  };
  return colorMap[result] || 'default';
};

/**
 * 根据产品分类获取需要的审批环节
 */
export const getApprovalStages = (category: ProductCategory): string[] => {
  const stages = ['本地化'];
  if (category.needLegalReview) {
    stages.push('法务');
  }
  if (category.needRsaApproval) {
    stages.push('RSA');
  }
  return stages;
};

/**
 * 初始化审批流
 */
export const initializeApprovalFlow = (stages: string[], approvers: Record<string, string>): Array<{
  stage: string;
  approver: string;
  result: string;
  time: string;
  comment: string;
}> => {
  return stages.map(stage => ({
    stage,
    approver: approvers[stage] || '待指定',
    result: 'pending',
    time: '',
    comment: '',
  }));
};

/**
 * 验证必填字段
 */
export const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  requiredFields.forEach(field => {
    const value = data[field];
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      errors[field] = '该字段为必填';
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * 格式化时间
 */
export const formatTime = (time: string): string => {
  if (!time) return '';
  try {
    const date = new Date(time);
    return date.toLocaleString('zh-CN');
  } catch {
    return time;
  }
};

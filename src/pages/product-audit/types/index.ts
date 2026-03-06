/**
 * 产品审核系统 - 类型定义
 */

/**
 * 产品分类
 */
export interface ProductCategory {
  id: number;
  name: string; // 中文名称
  nameEn: string; // 英文名称
  riskLevel: number; // 风险等级 1-10
  hasWhitelist: boolean; // 是否有白名单
  needLegalReview: boolean; // 是否需要法务审核
  needRsaApproval: boolean; // 是否需要RSA审批
  remark?: string; // 备注
  creator?: string; // 创建人
  editor?: string; // 编辑人
  deleted?: boolean; // 是否已删除
  deletedAt?: string; // 删除时间
  createdAt: string;
  updatedAt: string;
}

/**
 * 产品信息
 */
export interface Product {
  id: number;
  packageName: string; // 包名
  industry: string; // 所属行业（Google Play分类）
  developer: string; // 开发者名称
  packageSize: string; // 包体大小
  targetCountries: string[]; // 投放目标国家 (国家代码数组)
  shelfStatus: 'GA' | 'GP' | 'BOTH'; // 上架状态
  gaLink?: string; // GA链接（如果在GA上架）
  gpLink?: string; // GP链接（如果在GP上架）
  gpRating: number; // GP评分 (0-5，保留一位小数)
  attributionWindow: number; // 归因窗口期（天）
  settlementMethod: 'CPS' | 'CPA' | 'CPE' | 'CPP'; // 结算方式
  submitter: string; // 提交人
  submitTime: string; // 提交时间
  approvalStatus: ApprovalStatus; // 审批状态
  categoryId: number; // 产品分类ID (关联产品分类)
  isSaved?: boolean; // 是否为暂存状态
  approvalFlow: ApprovalRecord[]; // 审批流程
}

/**
 * 审批状态
 */
export enum ApprovalStatus {
  PENDING = 'pending', // 待提交（未提交审批）
  APPROVING = 'approving', // 审批中
  APPROVED = 'approved', // 审批通过
  REJECTED = 'rejected', // 审批驳回
}

/**
 * 审批环节
 */
export enum ApprovalStage {
  LOCALIZATION = '本地化',
  LEGAL = '法务',
  RSA = 'RSA',
}

/**
 * 审批结果
 */
export enum ApprovalResult {
  PENDING = 'pending', // 待审批
  APPROVED = 'approved', // 通过
  REJECTED = 'rejected', // 驳回
}

/**
 * 审批记录
 */
export interface ApprovalRecord {
  stage: string; // 审批环节
  approver: string; // 审批人
  result: ApprovalResult | string; // 审批结果
  time: string; // 审批时间
  comment: string; // 审批意见
}

/**
 * 审批任务（审批人待审批的任务）
 */
export interface ApprovalTask {
  id: number;
  productId: number;
  package: TName;
  industry: string;
  developer: string;
  submitter: string;
  submitTime: string;
  currentStage: string; // 当前所在审批环节
  approvalStatus: ApprovalStatus | string;
  approvalFlow: ApprovalRecord[]; // 已有的审批记录
}

/**
 * 用户
 */
export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'localization' | 'legal' | 'rsa' | 'submitter';
  approvalStages?: string[]; // 该用户能审批的环节
}

/**
 * Google Play 行业分类选项
 */
export interface IndustryOption {
  value: string;
  label: string;
}

/**
 * 国家选项
 */
export interface CountryOption {
  value: string;
  label: string;
}

export type TName = string;

/**
 * 产品审核系统 - 服务层
 */

import { request } from '@umijs/max';
import type { ProductCategory, Product, ApprovalTask } from '../types';
import { mockCategories, mockProducts, mockApprovalTasks } from './mock';

const STORAGE_KEY_CATEGORIES = 'product_audit_categories';
const STORAGE_KEY_PRODUCTS = 'product_audit_products';
const STORAGE_KEY_APPROVAL_TASKS = 'product_audit_approval_tasks';

const getStoredData = <T>(key: string, defaultData: T[]): T[] => {
  if (typeof window === 'undefined') return defaultData;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultData;
    
    const data = JSON.parse(stored);
    
    if (key === STORAGE_KEY_CATEGORIES) {
      return data.map((item: any) => ({
        ...item,
        hasWhitelist: Boolean(item.hasWhitelist),
        needLegalReview: Boolean(item.needLegalReview),
        needRsaApproval: Boolean(item.needRsaApproval),
      }));
    }
    
    return data;
  } catch {
    return defaultData;
  }
};

const saveStoredData = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('保存数据失败:', error);
  }
};

export const categoryService = {
  getAll: async (): Promise<ProductCategory[]> => {
    try {
      const response = await request<{ code: number; data: ProductCategory[]; msg: string }>('/api/categories', {
        method: 'GET',
      });
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.msg || '获取失败');
    } catch (error) {
      console.error('获取分类失败，使用本地数据:', error);
      return getStoredData(STORAGE_KEY_CATEGORIES, mockCategories);
    }
  },

  getById: async (id: number): Promise<ProductCategory | undefined> => {
    try {
      const response = await request<{ code: number; data: ProductCategory; msg: string }>(`/api/categories/${id}`, {
        method: 'GET',
      });
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.msg || '获取失败');
    } catch (error) {
      console.error('获取分类详情失败:', error);
      const categories = await categoryService.getAll();
      return categories.find(c => c.id === id);
    }
  },

  add: async (category: Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductCategory> => {
    try {
      const response = await request<{ code: number; data: ProductCategory; msg: string }>('/api/categories', {
        method: 'POST',
        data: category,
      });
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.msg || '创建失败');
    } catch (error) {
      console.error('创建分类失败:', error);
      const categories = await categoryService.getAll();
      
      const existName = categories.some(c => c.name === category.name);
      const existNameEn = categories.some(c => c.nameEn === category.nameEn);
      
      if (existName) {
        throw new Error('中文分类名称已存在');
      }
      if (existNameEn) {
        throw new Error('英文分类名称已存在');
      }

      const newCategory: ProductCategory = {
        id: Math.max(0, ...categories.map(c => c.id)) + 1,
        ...category,
        hasWhitelist: Boolean(category.hasWhitelist),
        needLegalReview: Boolean(category.needLegalReview),
        needRsaApproval: Boolean(category.needRsaApproval),
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      };

      const updated = [...categories, newCategory];
      saveStoredData(STORAGE_KEY_CATEGORIES, updated);
      return newCategory;
    }
  },

  update: async (id: number, category: Partial<Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProductCategory> => {
    try {
      const response = await request<{ code: number; data: ProductCategory; msg: string }>(`/api/categories/${id}`, {
        method: 'PUT',
        data: category,
      });
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.msg || '更新失败');
    } catch (error) {
      console.error('更新分类失败:', error);
      const categories = await categoryService.getAll();
      const index = categories.findIndex(c => c.id === id);
      
      if (index === -1) {
        throw new Error('产品分类不存在');
      }

      if (category.name) {
        const existName = categories.some(c => c.id !== id && c.name === category.name);
        if (existName) {
          throw new Error('中文分类名称已存在');
        }
      }
      if (category.nameEn) {
        const existNameEn = categories.some(c => c.id !== id && c.nameEn === category.nameEn);
        if (existNameEn) {
          throw new Error('英文分类名称已存在');
        }
      }

      const updated = {
        ...categories[index],
        ...category,
        updatedAt: new Date().toLocaleString(),
      };
      
      categories[index] = updated;
      saveStoredData(STORAGE_KEY_CATEGORIES, categories);
      return updated;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await request<{ code: number; data: null; msg: string }>(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (response.code !== 200) {
        throw new Error(response.msg || '删除失败');
      }
    } catch (error) {
      console.error('删除分类失败:', error);
      const categories = await categoryService.getAll();
      const updated = categories.filter(c => c.id !== id);
      saveStoredData(STORAGE_KEY_CATEGORIES, updated);
    }
  },
};

export const productService = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await request<{ code: number; data: Product[]; msg: string }>('/api/products', {
        method: 'GET',
      });
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.msg || '获取失败');
    } catch (error) {
      console.error('获取产品失败，使用本地数据:', error);
      return getStoredData(STORAGE_KEY_PRODUCTS, mockProducts);
    }
  },

  getById: async (id: number): Promise<Product | undefined> => {
    const products = await productService.getAll();
    return products.find(p => p.id === id);
  },

  add: async (product: Omit<Product, 'id' | 'approvalFlow'>): Promise<Product> => {
    const products = await productService.getAll();
    
    const newProduct: Product = {
      id: Math.max(0, ...products.map(p => p.id)) + 1,
      ...product,
      approvalFlow: [],
    };

    const updated = [...products, newProduct];
    saveStoredData(STORAGE_KEY_PRODUCTS, updated);
    return newProduct;
  },

  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    const products = await productService.getAll();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('产品不存在');
    }

    const updated = {
      ...products[index],
      ...product,
    };
    
    products[index] = updated;
    saveStoredData(STORAGE_KEY_PRODUCTS, products);
    return updated;
  },

  delete: async (id: number): Promise<void> => {
    const products = await productService.getAll();
    const updated = products.filter(p => p.id !== id);
    saveStoredData(STORAGE_KEY_PRODUCTS, updated);
  },
};

export const approvalTaskService = {
  getAll: async (): Promise<ApprovalTask[]> => {
    try {
      const response = await request<{ code: number; data: ApprovalTask[]; msg: string }>('/api/approvals', {
        method: 'GET',
      });
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.msg || '获取失败');
    } catch (error) {
      console.error('获取审批任务失败，使用本地数据:', error);
      return getStoredData(STORAGE_KEY_APPROVAL_TASKS, mockApprovalTasks);
    }
  },

  getById: async (id: number): Promise<ApprovalTask | undefined> => {
    const tasks = await approvalTaskService.getAll();
    return tasks.find(t => t.id === id);
  },

  update: async (id: number, task: Partial<ApprovalTask>): Promise<ApprovalTask> => {
    const tasks = await approvalTaskService.getAll();
    const index = tasks.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error('审批任务不存在');
    }

    const updated = {
      ...tasks[index],
      ...task,
    };
    
    tasks[index] = updated;
    saveStoredData(STORAGE_KEY_APPROVAL_TASKS, tasks);
    return updated;
  },
};

import { Router, Response } from 'express';
import prisma from '../config/database';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { ApiResponse, CreateCategoryRequest, UpdateCategoryRequest } from '../types';

const router = Router();

router.get('/', async (req, res: Response<ApiResponse<any[]>>) => {
  try {
    const categories = await prisma.category.findMany({
      where: { deleted: false },
      orderBy: { id: 'desc' }
    });

    return res.json({
      code: 200,
      data: categories,
      msg: '获取成功'
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.json({
      code: 500,
      data: [],
      msg: '服务器错误'
    });
  }
});

router.get('/:id', async (req, res: Response<ApiResponse<any>>) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.json({
        code: 400,
        data: null,
        msg: '无效的ID'
      });
    }

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.json({
        code: 404,
        data: null,
        msg: '分类不存在'
      });
    }

    return res.json({
      code: 200,
      data: category,
      msg: '获取成功'
    });
  } catch (error) {
    console.error('Get category error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

router.post('/', authMiddleware, roleMiddleware('admin', 'category_admin'), async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const data: CreateCategoryRequest = req.body;
    const currentUser = req.user?.username || 'admin';

    if (!data.name) {
      return res.json({
        code: 400,
        data: null,
        msg: '分类名称不能为空'
      });
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        nameEn: data.nameEn || null,
        hasWhitelist: data.hasWhitelist || false,
        needRsaApproval: data.needRsaApproval || false,
        needLegalReview: data.needLegalReview || false,
        remark: data.remark || null,
        creator: currentUser,
        editor: currentUser,
        description: data.description || null
      }
    });

    return res.json({
      code: 200,
      data: category,
      msg: '创建成功'
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('admin', 'category_admin'), async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.json({
        code: 400,
        data: null,
        msg: '无效的ID'
      });
    }

    const data: UpdateCategoryRequest = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.json({
        code: 404,
        data: null,
        msg: '分类不存在'
      });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name || existingCategory.name,
        nameEn: data.nameEn !== undefined ? data.nameEn : existingCategory.nameEn,
        hasWhitelist: data.hasWhitelist !== undefined ? data.hasWhitelist : existingCategory.hasWhitelist,
        needRsaApproval: data.needRsaApproval !== undefined ? data.needRsaApproval : existingCategory.needRsaApproval,
        needLegalReview: data.needLegalReview !== undefined ? data.needLegalReview : existingCategory.needLegalReview,
        remark: data.remark !== undefined ? data.remark : existingCategory.remark,
        editor: req.user?.username || 'admin',
        description: data.description !== undefined ? data.description : existingCategory.description
      }
    });

    return res.json({
      code: 200,
      data: category,
      msg: '更新成功'
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin', 'category_admin'), async (req: AuthRequest, res: Response<ApiResponse<null>>) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.json({
        code: 400,
        data: null,
        msg: '无效的ID'
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.json({
        code: 404,
        data: null,
        msg: '分类不存在'
      });
    }

    await prisma.category.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date()
      }
    });

    return res.json({
      code: 200,
      data: null,
      msg: '删除成功'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

export default router;

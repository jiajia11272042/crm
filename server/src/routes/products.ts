import { Router, Response } from 'express';
import prisma from '../config/database';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { ApiResponse, CreateProductRequest, UpdateProductRequest } from '../types';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const { page = 1, pageSize = 10, status, categoryId, name } = req.query;
    const user = req.user!;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId as string);
    }

    if (name) {
      where.name = { contains: name as string };
    }

    if (user.role === 'operator') {
      where.submittedBy = user.userId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          submitter: {
            select: { id: true, username: true, name: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return res.json({
      code: 200,
      data: {
        list: products,
        total,
        page: Number(page),
        pageSize: Number(pageSize)
      },
      msg: '获取成功'
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.json({
        code: 400,
        data: null,
        msg: '无效的ID'
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        submitter: {
          select: { id: true, username: true, name: true }
        },
        approvalSteps: {
          orderBy: { step: 'asc' },
          include: {
            reviewer: {
              select: { id: true, username: true, name: true }
            }
          }
        }
      }
    });

    if (!product) {
      return res.json({
        code: 404,
        data: null,
        msg: '产品不存在'
      });
    }

    return res.json({
      code: 200,
      data: product,
      msg: '获取成功'
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

router.post('/', authMiddleware, roleMiddleware('admin', 'operator'), async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const data: CreateProductRequest = req.body;

    if (!data.name) {
      return res.json({
        code: 400,
        data: null,
        msg: '产品名称不能为空'
      });
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        packageName: data.packageName || null,
        packageSize: data.packageSize || null,
        categoryId: data.categoryId || null,
        targetCountries: data.targetCountries || null,
        shelfStatus: data.shelfStatus || null,
        attributionWindow: data.attributionWindow || null,
        gpLink: data.gpLink || null,
        gaLink: data.gaLink || null,
        gpRating: data.gpRating || null,
        settlementType: data.settlementType || null,
        submittedBy: req.user!.userId,
        submitterName: data.submitterName || req.user!.username,
        submitTime: new Date(),
        status: 'pending'
      }
    });

    return res.json({
      code: 200,
      data: product,
      msg: '创建成功'
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('admin', 'operator'), async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.json({
        code: 400,
        data: null,
        msg: '无效的ID'
      });
    }

    const data: UpdateProductRequest = req.body;
    const user = req.user!;

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.json({
        code: 404,
        data: null,
        msg: '产品不存在'
      });
    }

    if (user.role === 'operator' && existingProduct.submittedBy !== user.userId) {
      return res.json({
        code: 403,
        data: null,
        msg: '只能修改自己提交的产品'
      });
    }

    if (existingProduct.status !== 'pending' && existingProduct.status !== 'rejected') {
      return res.json({
        code: 400,
        data: null,
        msg: '只能修改待审核或已拒绝的产品'
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name || existingProduct.name,
        packageName: data.packageName !== undefined ? data.packageName : existingProduct.packageName,
        packageSize: data.packageSize !== undefined ? data.packageSize : existingProduct.packageSize,
        categoryId: data.categoryId !== undefined ? data.categoryId : existingProduct.categoryId,
        targetCountries: data.targetCountries !== undefined ? data.targetCountries : existingProduct.targetCountries,
        shelfStatus: data.shelfStatus !== undefined ? data.shelfStatus : existingProduct.shelfStatus,
        attributionWindow: data.attributionWindow !== undefined ? data.attributionWindow : existingProduct.attributionWindow,
        gpLink: data.gpLink !== undefined ? data.gpLink : existingProduct.gpLink,
        gaLink: data.gaLink !== undefined ? data.gaLink : existingProduct.gaLink,
        gpRating: data.gpRating !== undefined ? data.gpRating : existingProduct.gpRating,
        settlementType: data.settlementType !== undefined ? data.settlementType : existingProduct.settlementType,
        status: 'pending'
      }
    });

    return res.json({
      code: 200,
      data: product,
      msg: '更新成功'
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req: AuthRequest, res: Response<ApiResponse<null>>) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.json({
        code: 400,
        data: null,
        msg: '无效的ID'
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.json({
        code: 404,
        data: null,
        msg: '产品不存在'
      });
    }

    await prisma.product.delete({
      where: { id }
    });

    return res.json({
      code: 200,
      data: null,
      msg: '删除成功'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

export default router;

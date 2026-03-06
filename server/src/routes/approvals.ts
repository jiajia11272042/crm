import { Router, Response } from 'express';
import prisma from '../config/database';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { ApiResponse, ApprovalActionRequest } from '../types';

const router = Router();

async function createApprovalSteps(productId: number, categoryId: number | null) {
  const approval = await prisma.approval.create({
    data: {
      productId,
      categoryId,
      status: 'in_progress'
    }
  });

  const steps = [];
  let currentStep = 1;

  steps.push({
    approvalId: approval.id,
    productId,
    step: currentStep,
    stepType: 'category_review',
    stepName: '分类审核',
    status: 'in_progress'
  });
  currentStep++;

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (category?.needLegalReview) {
      steps.push({
        approvalId: approval.id,
        productId,
        step: currentStep,
        stepType: 'legal_review',
        stepName: '法务审核',
        status: 'pending'
      });
      currentStep++;
    }

    if (category?.needRsaApproval) {
      steps.push({
        approvalId: approval.id,
        productId,
        step: currentStep,
        stepType: 'rsa_operation',
        stepName: 'RSA运营审核',
        status: 'pending'
      });
      currentStep++;
      steps.push({
        approvalId: approval.id,
        productId,
        step: currentStep,
        stepType: 'rsa_business',
        stepName: 'RSA商务审核',
        status: 'pending'
      });
      currentStep++;
      steps.push({
        approvalId: approval.id,
        productId,
        step: currentStep,
        stepType: 'rsa_legal',
        stepName: 'RSA法务审核',
        status: 'pending'
      });
    }
  }

  if (steps.length > 0) {
    await prisma.approvalStep.createMany({
      data: steps
    });
  }

  return approval;
}

router.get('/', authMiddleware, roleMiddleware('admin', 'approver'), async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const { page = 1, pageSize = 10, status, productName } = req.query;
    const user = req.user!;

    const where: any = {
      status: { not: 'pending' }
    };

    if (status) {
      where.status = status;
    }

    if (productName) {
      where.product = {
        name: { contains: productName as string }
      };
    }

    const [approvals, total] = await Promise.all([
      prisma.approval.findMany({
        where,
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            include: {
              category: true,
              submitter: {
                select: { id: true, username: true, name: true }
              }
            }
          },
          category: true,
          steps: {
            orderBy: { step: 'asc' }
          }
        }
      }),
      prisma.approval.count({ where })
    ]);

    const list = approvals.map(approval => ({
      id: approval.id,
      productId: approval.productId,
      status: approval.status,
      product: approval.product,
      category: approval.category,
      submitter: approval.product?.submitter,
      submitTime: approval.product?.submitTime,
      approvalSteps: approval.steps
    }));

    return res.json({
      code: 200,
      data: {
        list,
        total,
        page: Number(page),
        pageSize: Number(pageSize)
      },
      msg: '获取成功'
    });
  } catch (error) {
    console.error('Get approvals error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

router.get('/:productId', authMiddleware, roleMiddleware('admin', 'approver'), async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const productId = parseInt(req.params.productId as string);
    if (isNaN(productId)) {
      return res.json({
        code: 400,
        data: null,
        msg: '无效的产品ID'
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
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
    console.error('Get approval detail error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

router.post('/:productId/start', authMiddleware, roleMiddleware('admin', 'approver'), async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const productId = parseInt(req.params.productId as string);
    if (isNaN(productId)) {
      return res.json({
        code: 400,
        data: null,
        msg: '无效的产品ID'
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        approvalSteps: true
      }
    });

    if (!product) {
      return res.json({
        code: 404,
        data: null,
        msg: '产品不存在'
      });
    }

    if (product.status !== 'pending') {
      return res.json({
        code: 400,
        data: null,
        msg: '产品状态不是待审核'
      });
    }

    if (product.approvalSteps.length === 0) {
      await createApprovalSteps(productId, product.categoryId);
    }

    const firstStep = await prisma.approvalStep.findFirst({
      where: { productId, status: 'pending' },
      orderBy: { step: 'asc' }
    });

    if (firstStep) {
      await prisma.approvalStep.update({
        where: { id: firstStep.id },
        data: { status: 'in_progress' }
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { status: 'in_progress' }
    });

    return res.json({
      code: 200,
      data: updatedProduct,
      msg: '开始审核成功'
    });
  } catch (error) {
    console.error('Start approval error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

router.post('/:productId/approve', authMiddleware, roleMiddleware('admin', 'approver'), async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const productId = parseInt(req.params.productId as string);
    const { action, comment, approvedCategoryId }: ApprovalActionRequest = req.body;

    if (isNaN(productId)) {
      return res.json({
        code: 400,
        data: null,
        msg: '无效的产品ID'
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        approvalSteps: {
          orderBy: { step: 'asc' }
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

    if (product.status !== 'in_progress') {
      return res.json({
        code: 400,
        data: null,
        msg: '产品不在审批中'
      });
    }

    const currentStep = product.approvalSteps.find(s => s.status === 'in_progress');

    if (!currentStep) {
      return res.json({
        code: 400,
        data: null,
        msg: '当前没有待处理的审批步骤'
      });
    }

    if (action === 'reject') {
      await prisma.approvalStep.update({
        where: { id: currentStep.id },
        data: {
          status: 'rejected',
          reviewedBy: req.user!.userId,
          reviewComment: comment || '',
          reviewedAt: new Date()
        }
      });

      await prisma.product.update({
        where: { id: productId },
        data: { status: 'rejected' }
      });

      return res.json({
        code: 200,
        data: null,
        msg: '已拒绝'
      });
    }

    await prisma.approvalStep.update({
      where: { id: currentStep.id },
      data: {
        status: 'approved',
        reviewedBy: req.user!.userId,
        reviewComment: comment || '',
        reviewedAt: new Date(),
        approvedCategoryId: approvedCategoryId || null
      }
    });

    const nextStep = product.approvalSteps.find(s => s.status === 'pending');

    if (nextStep) {
      await prisma.approvalStep.update({
        where: { id: nextStep.id },
        data: { status: 'in_progress' }
      });

      return res.json({
        code: 200,
        data: null,
        msg: '通过，进入下一步审批'
      });
    }

    await prisma.product.update({
      where: { id: productId },
      data: { status: 'approved' }
    });

    return res.json({
      code: 200,
      data: null,
      msg: '审批完成，产品已通过'
    });
  } catch (error) {
    console.error('Approve error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

export default router;

router.get('/history/categories', authMiddleware, async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const { packageName } = req.query;

    if (!packageName) {
      return res.json({
        code: 400,
        data: null,
        msg: '包名不能为空'
      });
    }

    const approvedSteps = await prisma.approvalStep.findMany({
      where: {
        product: {
          packageName: packageName as string
        },
        status: 'approved',
        approvedCategoryId: { not: null }
      },
      include: {
        product: {
          select: { categoryId: true }
        },
        reviewer: {
          select: { id: true, username: true, name: true }
        }
      },
      orderBy: { reviewedAt: 'desc' }
    });

    const categoryIds = [...new Set(approvedSteps.map(s => s.approvedCategoryId).filter(Boolean))];
    
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds as number[] }
      }
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<number, any>);

    const uniqueCategoryMap = new Map<number, any>();
    for (const step of approvedSteps) {
      if (step.approvedCategoryId && categoryMap[step.approvedCategoryId]) {
        if (!uniqueCategoryMap.has(step.approvedCategoryId)) {
          uniqueCategoryMap.set(step.approvedCategoryId, {
            ...categoryMap[step.approvedCategoryId],
            lastApprovedTime: step.reviewedAt ? new Date(step.reviewedAt).toISOString().replace('T', ' ').substring(0, 19) : null
          });
        }
      }
    }

    const result = Array.from(uniqueCategoryMap.values());

    return res.json({
      code: 200,
      data: result,
      msg: '获取成功'
    });
  } catch (error) {
    console.error('Get history categories error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

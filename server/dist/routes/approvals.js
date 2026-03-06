"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
async function createApprovalSteps(productId, categoryId) {
    const approval = await database_1.default.approval.create({
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
        const category = await database_1.default.category.findUnique({
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
        await database_1.default.approvalStep.createMany({
            data: steps
        });
    }
    return approval;
}
router.get('/', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('admin', 'approver'), async (req, res) => {
    try {
        const { page = 1, pageSize = 10, status, productName } = req.query;
        const user = req.user;
        const where = {
            status: { not: 'pending' }
        };
        if (status) {
            where.status = status;
        }
        if (productName) {
            where.product = {
                name: { contains: productName }
            };
        }
        const [approvals, total] = await Promise.all([
            database_1.default.approval.findMany({
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
            database_1.default.approval.count({ where })
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
    }
    catch (error) {
        console.error('Get approvals error:', error);
        return res.json({
            code: 500,
            data: null,
            msg: '服务器错误'
        });
    }
});
router.get('/:productId', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('admin', 'approver'), async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        if (isNaN(productId)) {
            return res.json({
                code: 400,
                data: null,
                msg: '无效的产品ID'
            });
        }
        const product = await database_1.default.product.findUnique({
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
    }
    catch (error) {
        console.error('Get approval detail error:', error);
        return res.json({
            code: 500,
            data: null,
            msg: '服务器错误'
        });
    }
});
router.post('/:productId/start', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('admin', 'approver'), async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        if (isNaN(productId)) {
            return res.json({
                code: 400,
                data: null,
                msg: '无效的产品ID'
            });
        }
        const product = await database_1.default.product.findUnique({
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
        const firstStep = await database_1.default.approvalStep.findFirst({
            where: { productId, status: 'pending' },
            orderBy: { step: 'asc' }
        });
        if (firstStep) {
            await database_1.default.approvalStep.update({
                where: { id: firstStep.id },
                data: { status: 'in_progress' }
            });
        }
        const updatedProduct = await database_1.default.product.update({
            where: { id: productId },
            data: { status: 'in_progress' }
        });
        return res.json({
            code: 200,
            data: updatedProduct,
            msg: '开始审核成功'
        });
    }
    catch (error) {
        console.error('Start approval error:', error);
        return res.json({
            code: 500,
            data: null,
            msg: '服务器错误'
        });
    }
});
router.post('/:productId/approve', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('admin', 'approver'), async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        const { action, comment, approvedCategoryId } = req.body;
        if (isNaN(productId)) {
            return res.json({
                code: 400,
                data: null,
                msg: '无效的产品ID'
            });
        }
        const product = await database_1.default.product.findUnique({
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
            await database_1.default.approvalStep.update({
                where: { id: currentStep.id },
                data: {
                    status: 'rejected',
                    reviewedBy: req.user.userId,
                    reviewComment: comment || '',
                    reviewedAt: new Date()
                }
            });
            await database_1.default.product.update({
                where: { id: productId },
                data: { status: 'rejected' }
            });
            return res.json({
                code: 200,
                data: null,
                msg: '已拒绝'
            });
        }
        await database_1.default.approvalStep.update({
            where: { id: currentStep.id },
            data: {
                status: 'approved',
                reviewedBy: req.user.userId,
                reviewComment: comment || '',
                reviewedAt: new Date(),
                approvedCategoryId: approvedCategoryId || null
            }
        });
        const nextStep = product.approvalSteps.find(s => s.status === 'pending');
        if (nextStep) {
            await database_1.default.approvalStep.update({
                where: { id: nextStep.id },
                data: { status: 'in_progress' }
            });
            return res.json({
                code: 200,
                data: null,
                msg: '通过，进入下一步审批'
            });
        }
        await database_1.default.product.update({
            where: { id: productId },
            data: { status: 'approved' }
        });
        return res.json({
            code: 200,
            data: null,
            msg: '审批完成，产品已通过'
        });
    }
    catch (error) {
        console.error('Approve error:', error);
        return res.json({
            code: 500,
            data: null,
            msg: '服务器错误'
        });
    }
});
exports.default = router;
router.get('/history/categories', auth_1.authMiddleware, async (req, res) => {
    try {
        const { packageName } = req.query;
        if (!packageName) {
            return res.json({
                code: 400,
                data: null,
                msg: '包名不能为空'
            });
        }
        const approvedSteps = await database_1.default.approvalStep.findMany({
            where: {
                product: {
                    packageName: packageName
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
        const categories = await database_1.default.category.findMany({
            where: {
                id: { in: categoryIds }
            }
        });
        const categoryMap = categories.reduce((acc, cat) => {
            acc[cat.id] = cat;
            return acc;
        }, {});
        const uniqueCategoryMap = new Map();
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
    }
    catch (error) {
        console.error('Get history categories error:', error);
        return res.json({
            code: 500,
            data: null,
            msg: '服务器错误'
        });
    }
});
//# sourceMappingURL=approvals.js.map
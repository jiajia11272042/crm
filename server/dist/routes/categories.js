"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const categories = await database_1.default.category.findMany({
            where: { deleted: false },
            orderBy: { id: 'desc' }
        });
        return res.json({
            code: 200,
            data: categories,
            msg: '获取成功'
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        return res.json({
            code: 500,
            data: [],
            msg: '服务器错误'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.json({
                code: 400,
                data: null,
                msg: '无效的ID'
            });
        }
        const category = await database_1.default.category.findUnique({
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
    }
    catch (error) {
        console.error('Get category error:', error);
        return res.json({
            code: 500,
            data: null,
            msg: '服务器错误'
        });
    }
});
router.post('/', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('admin', 'category_admin'), async (req, res) => {
    try {
        const data = req.body;
        const currentUser = req.user?.username || 'admin';
        if (!data.name) {
            return res.json({
                code: 400,
                data: null,
                msg: '分类名称不能为空'
            });
        }
        const category = await database_1.default.category.create({
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
    }
    catch (error) {
        console.error('Create category error:', error);
        return res.json({
            code: 500,
            data: null,
            msg: '服务器错误'
        });
    }
});
router.put('/:id', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('admin', 'category_admin'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.json({
                code: 400,
                data: null,
                msg: '无效的ID'
            });
        }
        const data = req.body;
        const existingCategory = await database_1.default.category.findUnique({
            where: { id }
        });
        if (!existingCategory) {
            return res.json({
                code: 404,
                data: null,
                msg: '分类不存在'
            });
        }
        const category = await database_1.default.category.update({
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
    }
    catch (error) {
        console.error('Update category error:', error);
        return res.json({
            code: 500,
            data: null,
            msg: '服务器错误'
        });
    }
});
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('admin', 'category_admin'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.json({
                code: 400,
                data: null,
                msg: '无效的ID'
            });
        }
        const existingCategory = await database_1.default.category.findUnique({
            where: { id }
        });
        if (!existingCategory) {
            return res.json({
                code: 404,
                data: null,
                msg: '分类不存在'
            });
        }
        await database_1.default.category.update({
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
    }
    catch (error) {
        console.error('Delete category error:', error);
        return res.json({
            code: 500,
            data: null,
            msg: '服务器错误'
        });
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map
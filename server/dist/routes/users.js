"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('admin'), async (req, res) => {
    try {
        const users = await database_1.default.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                name: true,
                createdAt: true
            },
            orderBy: { id: 'asc' }
        });
        const usersWithRoles = await Promise.all(users.map(async (user) => {
            const userRoles = await database_1.default.userRole.findMany({
                where: { userId: user.id },
                select: { role: true }
            });
            return {
                ...user,
                roles: userRoles.map(ur => ur.role)
            };
        }));
        return res.json({
            code: 200,
            data: usersWithRoles,
            msg: '获取成功'
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        return res.json({
            code: 500,
            data: null,
            msg: '服务器错误'
        });
    }
});
router.get('/roles', auth_1.authMiddleware, async (req, res) => {
    try {
        const roles = await database_1.default.userRole.findMany({
            orderBy: { userId: 'asc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                }
            }
        });
        return res.json({
            code: 200,
            data: roles,
            msg: '获取成功'
        });
    }
    catch (error) {
        console.error('Get roles error:', error);
        return res.json({
            code: 500,
            data: null,
            msg: '服务器错误'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map
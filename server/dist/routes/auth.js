"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.json({
                code: 400,
                data: null,
                msg: '用户名和密码不能为空'
            });
        }
        const user = await database_1.default.user.findUnique({
            where: { username }
        });
        if (!user) {
            return res.json({
                code: 401,
                data: null,
                msg: '用户名或密码错误'
            });
        }
        // 暂时不使用密码加密，直接比较明文密码
        if (!bcryptjs_1.default.compareSync(password, user.password)) {
            return res.json({
                code: 401,
                data: null,
                msg: '用户名或密码错误'
            });
        }
        const userRoles = await database_1.default.userRole.findMany({
            where: { userId: user.id },
            select: { role: true }
        });
        const roles = userRoles.map(ur => ur.role);
        const token = (0, auth_1.generateToken)({
            userId: user.id,
            username: user.username,
            role: user.role,
            roles
        });
        return res.json({
            code: 200,
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    name: user.name || undefined
                }
            },
            msg: '登录成功'
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.json({
            code: 500,
            data: null,
            msg: '服务器错误'
        });
    }
});
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                username: true,
                role: true,
                name: true,
                createdAt: true
            }
        });
        if (!user) {
            return res.json({
                code: 404,
                data: null,
                msg: '用户不存在'
            });
        }
        return res.json({
            code: 200,
            data: user,
            msg: '获取成功'
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        return res.json({
            code: 500,
            data: null,
            msg: '服务器错误'
        });
    }
});
router.post('/logout', async (req, res) => {
    return res.json({
        code: 200,
        data: null,
        msg: '退出成功'
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map
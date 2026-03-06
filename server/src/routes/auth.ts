import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';
import { ApiResponse, LoginResponse } from '../types';

const router = Router();

router.post('/login', async (req, res: Response<ApiResponse<LoginResponse | null>>) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({
        code: 400,
        data: null,
        msg: '用户名和密码不能为空'
      });
    }

    const user = await prisma.user.findUnique({
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
if (!bcrypt.compareSync(password, user.password)) {
      return res.json({
        code: 401,
        data: null,
        msg: '用户名或密码错误'
      });
    }
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      select: { role: true }
    });
    const roles = userRoles.map(ur => ur.role);
    
    const token = generateToken({
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
  } catch (error) {
    console.error('Login error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
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
  } catch (error) {
    console.error('Get user error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

router.post('/logout', async (req, res: Response<ApiResponse<null>>) => {
  return res.json({
    code: 200,
    data: null,
    msg: '退出成功'
  });
});

export default router;

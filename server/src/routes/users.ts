import { Router, Response } from 'express';
import prisma from '../config/database';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('admin'), async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        name: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    });

    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const userRoles = await prisma.userRole.findMany({
          where: { userId: user.id },
          select: { role: true }
        });
        return {
          ...user,
          roles: userRoles.map(ur => ur.role)
        };
      })
    );

    return res.json({
      code: 200,
      data: usersWithRoles,
      msg: '获取成功'
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

router.get('/roles', authMiddleware, async (req: AuthRequest, res: Response<ApiResponse<any>>) => {
  try {
    const roles = await prisma.userRole.findMany({
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
  } catch (error) {
    console.error('Get roles error:', error);
    return res.json({
      code: 500,
      data: null,
      msg: '服务器错误'
    });
  }
});

export default router;

import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireAdmin } from '../middleware/auth';
import { createUserSchema, updateUserSchema } from '../types/schemas';
import { usersService } from '../services/users.service';

const router = Router();

router.get('/', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const users = await usersService.list();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const user = await usersService.getById(id);
    res.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === 'Пользователь не найден') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const payload = createUserSchema.parse(req.body);
    const user = await usersService.create(payload);
    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === 'Пользователь с таким email уже существует') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const payload = updateUserSchema.parse(req.body);
    const user = await usersService.update(id, payload);
    res.json({ user });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === 'Пользователь с таким email уже существует' ||
        error.message === 'Пользователь не найден' ||
        error.message === 'Нет данных для обновления')
    ) {
      const status = error.message === 'Пользователь не найден' ? 404 : 400;
      return res.status(status).json({ error: error.message });
    }
    next(error);
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    await usersService.remove(id);
    res.json({ message: 'Пользователь удален' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Пользователь не найден') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

export default router;

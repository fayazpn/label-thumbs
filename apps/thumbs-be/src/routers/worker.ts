import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { workerAuthMiddleware } from '../middleware/authMiddleware';

const router = Router();

const prismaClient = new PrismaClient();

router.get('/nextTask', workerAuthMiddleware, async (req, res) => {
  // @ts-ignore
  const workerId = req.workerId;

  const nextTask = await prismaClient.task.findFirst({
    where: {
      done: false,
      submissions: {
        none: {
          worker_id: workerId,
        },
      },
    },
    select: {
      id: true,
      amount: true,
      title: true,
      options: true,
    },
  });

  if (!nextTask) {
    return res.status(411).json({
      message: 'There is no more task left to review',
    });
  }

  res.json({
    task: nextTask,
  });
});

router.post('/signin', async (req, res) => {
  // TODO: Add sign verification logic here
  const hardcodedWalletAddress = 'HvnVJwvH5xKz2VWmAx77BnQwYNqaLw1emzQSpwfiYrJB';

  const existingWorker = await prismaClient.worker.findFirst({
    where: {
      address: hardcodedWalletAddress,
    },
  });

  if (existingWorker) {
    const token = jwt.sign(
      {
        workerId: existingWorker.id,
      },
      process.env.JWT_SECRET_WORKER
    );

    return res.json({
      token,
    });
  } else {
    const newWorker = await prismaClient.worker.create({
      data: {
        address: hardcodedWalletAddress,
        pending_amount: 0,
        locked_amount: 0,
      },
    });

    const token = jwt.sign(
      {
        workerId: newWorker.id,
      },
      process.env.JWT_SECRET_WORKER
    );

    return res.json({
      token,
    });
  }
});

export default router;

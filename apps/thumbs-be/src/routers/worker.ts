import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { TOTAL_DECIMALS } from '../config';
import { getNextTask } from '../db';
import { workerAuthMiddleware } from '../middleware/authMiddleware';
import { createSubmissionInput } from '../types';

const router = Router();
const TOTAL_SUBMISSIONS = 100;

const prismaClient = new PrismaClient();

router.post('/submission', workerAuthMiddleware, async (req, res) => {
  // @ts-ignore
  const workerId = req.workerId;
  const body = req.body;

  const parsedBody = createSubmissionInput.safeParse(body);

  if (parsedBody.success) {
    const taskId = Number(parsedBody.data.taskId);

    const task = await getNextTask(workerId);
    if (!task || task.id !== taskId) {
      return res.status(411).json({
        message: 'Incorrect task ID',
      });
    }

    const amount = Number(task.amount) / TOTAL_SUBMISSIONS;

    await prismaClient.$transaction(async (tx) => {
      const submission = await tx.submission.create({
        data: {
          worker_id: workerId,
          option_id: Number(parsedBody.data.selection),
          task_id: Number(parsedBody.data.taskId),
          amount: amount,
        },
      });

      await tx.worker.update({
        where: {
          id: workerId,
        },
        data: {
          pending_amount: {
            increment: Number(amount),
          },
        },
      });

      return submission;
    });

    const nextTask = await getNextTask(workerId);

    res.json({
      nextTask,
      amount,
    });
  } else {
    res.status(411).json({
      message: 'Incorrct inputs',
    });
  }
});

router.get('/nextTask', workerAuthMiddleware, async (req, res) => {
  // @ts-ignore
  const workerId = req.workerId;

  const nextTask = await getNextTask(workerId);

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
      amount: existingWorker.pending_amount / TOTAL_DECIMALS,
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

import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

const prismaClient = new PrismaClient();

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
        userId: existingWorker.id,
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
        userId: newWorker.id,
      },
      process.env.JWT_SECRET_WORKER
    );

    return res.json({
      token,
    });
  }
});

export default router;

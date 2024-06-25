import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import process from 'process';
import { authMiddlware } from '../middleware/authMiddlware';
import { createTaskInput } from '../types';

const router = Router();

const prismaClient = new PrismaClient();

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ACCESS_SECRET,
  },
  region: 'us-east-1',
});

router.post('/task', authMiddlware, async (req, res) => {
  const body = req.body;
  const parseData = createTaskInput.safeParse(body);
  // @ts-ignore
  const userId = req.userId;

  // parse the signature to ensure the user paid the required amount
  const response = await prismaClient.$transaction(async (tx) => {
    const response = await tx.task.create({
      data: {
        title: parseData.data.title,
        amount: '0.1',
        signature: parseData.data.signature,
        user_id: userId,
      },
    });

    await tx.option.createMany({
      data: parseData.data.options.map((option) => ({
        image_url: option.imageUrl,
        task_id: response.id,
      })),
    });

    return response;
  });

  res.json({
    id: response.id,
  });
});

router.get('/presignedUrl', authMiddlware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;

  const command = new PutObjectCommand({
    ContentType: 'image/jpeg',
    Bucket: 'thumbnailer-project',
    Key: `thumbnails/${userId}/${Math.random()}/image.jpg`,
  });

  const clientUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  res.json({
    preSignedUrl: clientUrl,
  });
});

router.post('/signin', async (req, res) => {
  // TODO: Add sign verification logic here
  const hardcodedWalletAddress = 'HvnVJwvH5xKz2VWmAx77BnQwYNqaLw1emzQSpwfiYrJB';

  const existingUser = await prismaClient.user.findFirst({
    where: {
      address: hardcodedWalletAddress,
    },
  });

  if (existingUser) {
    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      process.env.JWT_SECRET
    );

    return res.json({
      token,
    });
  } else {
    const newUser = await prismaClient.user.create({
      data: {
        address: hardcodedWalletAddress,
      },
    });

    const token = jwt.sign(
      {
        userId: newUser.id,
      },
      process.env.JWT_SECRET
    );

    return res.json({
      token,
    });
  }
});

export default router;

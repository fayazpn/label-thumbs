import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

export async function getNextTask(workerId: number) {
  return await prismaClient.task.findFirst({
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
}

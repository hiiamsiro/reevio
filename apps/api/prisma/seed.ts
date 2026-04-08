import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.user.upsert({
    where: {
      email: 'demo@reevio.app',
    },
    update: {
      name: 'Demo User',
      plan: 'FREE',
    },
    create: {
      email: 'demo@reevio.app',
      name: 'Demo User',
      plan: 'FREE',
      credits: 25,
    },
  });
}

main()
  .catch(async (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

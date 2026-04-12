import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/auth/auth-password';

const prisma = new PrismaClient();

const ADMIN_PASSWORD = 'Abc@!234';

async function main(): Promise<void> {
  const adminPasswordHash = await hashPassword(ADMIN_PASSWORD);

  await prisma.user.upsert({
    where: {
      email: 'demo@reevio.app',
    },
    update: {
      name: 'Demo User',
      plan: 'FREE',
      role: 'MEMBER',
    },
    create: {
      email: 'demo@reevio.app',
      name: 'Demo User',
      plan: 'FREE',
      role: 'MEMBER',
      credits: 25,
    },
  });

  await prisma.user.upsert({
    where: {
      email: 'admin@reevio.app',
    },
    update: {
      name: 'Admin',
      plan: 'PREMIUM',
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
    },
    create: {
      email: 'admin@reevio.app',
      name: 'Admin',
      plan: 'PREMIUM',
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
      credits: 9999,
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

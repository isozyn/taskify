import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verifyUser() {
  try {
    const user = await prisma.user.update({
      where: { email: 'test@example.com' },
      data: { isEmailVerified: true }
    });
    console.log('✅ User verified successfully:', user.email);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUser();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProjectMembers() {
  try {
    console.log('🔍 Testing Project 14 Members API...\n');

    // Test 1: Raw query to see what's in the database
    const rawMembers = await prisma.$queryRaw`
      SELECT pm.*, u.name, u.email 
      FROM "ProjectMember" pm
      JOIN "User" u ON pm."userId" = u.id
      WHERE pm."projectId" = 14
    `;
    console.log('📋 Raw Database Query Result:');
    console.log(rawMembers);
    console.log('');

    // Test 2: Prisma query to see what Prisma returns
    const project = await prisma.project.findUnique({
      where: { id: 14 },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    console.log('📋 Prisma Query Result:');
    console.log('Project:', project?.title);
    console.log('Owner:', project?.owner?.name);
    console.log('Members count:', project?.members?.length);
    console.log('Members:', JSON.stringify(project?.members, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProjectMembers();

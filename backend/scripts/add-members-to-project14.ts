import { PrismaClient } from '@prisma/client';

declare const process: any;

const prisma = new PrismaClient();

async function addMembersToProject14() {
  try {
    console.log('👥 Adding members to Project 14 (Your Website Redesign project)...\n');

    const project = await prisma.project.findUnique({
      where: { id: 14 },
      include: {
        owner: true,
      },
    });

    if (!project) {
      console.log('❌ Project 14 not found');
      return;
    }

    console.log(`📋 Project: ${project.title} (Owner: ${project.owner.name})\n`);

    // Add Byron, Alice, Bob, Charlie as members
    const membersToAdd = [
      { userId: 8, name: 'Byron Young', role: 'MEMBER' },
      { userId: 9, name: 'Alice Johnson', role: 'PROJECT_MANAGER' },
      { userId: 10, name: 'Bob Smith', role: 'MEMBER' },
      { userId: 11, name: 'Charlie Brown', role: 'MEMBER' },
    ];

    for (const member of membersToAdd) {
      try {
        await prisma.projectMember.create({
          data: {
            projectId: 14,
            userId: member.userId,
            role: member.role as any,
          },
        });
        console.log(`✅ Added ${member.name} as ${member.role}`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️  ${member.name} is already a member`);
        } else {
          console.log(`❌ Error adding ${member.name}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Done! Now create a conversation with these members.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addMembersToProject14();

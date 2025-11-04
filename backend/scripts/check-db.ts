import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...\n');

    // Check all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
      },
    });

    console.log('📋 Users in database:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Username: ${user.username}`);
    });

    // Check projects
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        ownerId: true,
      },
    });

    console.log('\n📋 Projects in database:');
    projects.forEach(project => {
      console.log(`  - ID: ${project.id}, Title: ${project.title}, Owner ID: ${project.ownerId}`);
    });

    // Check project members
    const projectMembers = await prisma.projectMember.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            title: true,
          },
        },
      },
    });

    console.log('\n📋 Project Members:');
    projectMembers.forEach(member => {
      console.log(`  - Project: "${member.project.title}", User: ${member.user.name} (${member.user.email}), Role: ${member.role}`);
    });

    // Check conversations
    const conversations = await prisma.conversation.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    console.log('\n📋 Conversations:');
    conversations.forEach(conv => {
      const memberNames = conv.members.map(m => m.user.name).join(', ');
      console.log(`  - ID: ${conv.id}, Name: ${conv.name}, Type: ${conv.type}, Project ID: ${conv.projectId}, Members: ${memberNames}`);
    });

    // Generate proper password hash for "password123"
    console.log('\n🔐 Generating proper password hash for "password123"...');
    const properHash = await bcrypt.hash('password123', 10);
    console.log('Password hash:', properHash);

    console.log('\n✅ Database check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

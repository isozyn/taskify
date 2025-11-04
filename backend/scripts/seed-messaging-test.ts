import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

declare const process: any;

const prisma = new PrismaClient();

async function seedMessagingData() {
  try {
    console.log('🌱 Seeding messaging test data...\n');

    // 1. Find Byron's existing project (created by devbybyron@gmail.com)
    const byronUser = await prisma.user.findUnique({
      where: { email: 'devbybyron@gmail.com' },
    });

    if (!byronUser) {
      console.log('❌ Byron user (devbybyron@gmail.com) not found');
      return;
    }

    console.log(`✅ Found Byron: ${byronUser.name} (ID: ${byronUser.id})\n`);

    // Find Byron's Website Redesign project
    const websiteProject = await prisma.project.findFirst({
      where: {
        ownerId: byronUser.id,
        title: {
          contains: 'Website Redesign',
        },
      },
    });

    if (!websiteProject) {
      console.log('❌ Website Redesign project not found');
      return;
    }

    console.log(`✅ Found Project: ${websiteProject.title} (ID: ${websiteProject.id})\n`);

    // 2. Create test users with proper bcrypt hash for "password123"
    const properPasswordHash = await bcrypt.hash('password123', 10);
    console.log('🔐 Generated password hash for "password123"\n');

    console.log('👥 Creating test users...');
    const testUsers = await Promise.all([
      prisma.user.upsert({
        where: { email: 'alice.johnson@taskify.com' },
        update: {},
        create: {
          name: 'Alice Johnson',
          email: 'alice.johnson@taskify.com',
          username: 'alice_johnson',
          password: properPasswordHash,
          role: 'USER',
          isEmailVerified: true,
        },
      }),
      prisma.user.upsert({
        where: { email: 'bob.smith@taskify.com' },
        update: {},
        create: {
          name: 'Bob Smith',
          email: 'bob.smith@taskify.com',
          username: 'bob_smith',
          password: properPasswordHash,
          role: 'USER',
          isEmailVerified: true,
        },
      }),
      prisma.user.upsert({
        where: { email: 'charlie.brown@taskify.com' },
        update: {},
        create: {
          name: 'Charlie Brown',
          email: 'charlie.brown@taskify.com',
          username: 'charlie_brown',
          password: properPasswordHash,
          role: 'USER',
          isEmailVerified: true,
        },
      }),
      prisma.user.upsert({
        where: { email: 'diana.prince@taskify.com' },
        update: {},
        create: {
          name: 'Diana Prince',
          email: 'diana.prince@taskify.com',
          username: 'diana_prince',
          password: properPasswordHash,
          role: 'USER',
          isEmailVerified: true,
        },
      }),
    ]);

    console.log(`✅ Created/Updated ${testUsers.length} test users\n`);

    const [alice, bob, charlie, diana] = testUsers;

    // 3. Add users as members to Byron's Website Redesign project
    console.log('📋 Adding members to Website Redesign project...');
    
    const members = await Promise.all([
      prisma.projectMember.upsert({
        where: {
          userId_projectId: {
            userId: alice.id,
            projectId: websiteProject.id,
          },
        },
        update: {},
        create: {
          userId: alice.id,
          projectId: websiteProject.id,
          role: 'MEMBER',
        },
      }),
      prisma.projectMember.upsert({
        where: {
          userId_projectId: {
            userId: bob.id,
            projectId: websiteProject.id,
          },
        },
        update: {},
        create: {
          userId: bob.id,
          projectId: websiteProject.id,
          role: 'MEMBER',
        },
      }),
      prisma.projectMember.upsert({
        where: {
          userId_projectId: {
            userId: charlie.id,
            projectId: websiteProject.id,
          },
        },
        update: {},
        create: {
          userId: charlie.id,
          projectId: websiteProject.id,
          role: 'MEMBER',
        },
      }),
      prisma.projectMember.upsert({
        where: {
          userId_projectId: {
            userId: diana.id,
            projectId: websiteProject.id,
          },
        },
        update: {},
        create: {
          userId: diana.id,
          projectId: websiteProject.id,
          role: 'MEMBER',
        },
      }),
    ]);

    console.log(`✅ Added ${members.length} members to the project\n`);

    // 4. Create conversations
    console.log('💬 Creating conversations...');
    
    const conversations = await Promise.all([
      // General team conversation
      prisma.conversation.create({
        data: {
          name: 'Team General',
          type: 'GROUP',
          projectId: websiteProject.id,
          members: {
            create: [
              { userId: byronUser.id },
              { userId: alice.id },
              { userId: bob.id },
              { userId: charlie.id },
              { userId: diana.id },
            ],
          },
        },
      }),
      // Frontend team
      prisma.conversation.create({
        data: {
          name: 'Frontend Team',
          type: 'GROUP',
          projectId: websiteProject.id,
          members: {
            create: [
              { userId: byronUser.id },
              { userId: alice.id },
              { userId: bob.id },
            ],
          },
        },
      }),
      // Direct message: Byron & Alice
      prisma.conversation.create({
        data: {
          name: `${byronUser.name} & ${alice.name}`,
          type: 'DIRECT',
          projectId: websiteProject.id,
          members: {
            create: [
              { userId: byronUser.id },
              { userId: alice.id },
            ],
          },
        },
      }),
      // Direct message: Byron & Bob
      prisma.conversation.create({
        data: {
          name: `${byronUser.name} & ${bob.name}`,
          type: 'DIRECT',
          projectId: websiteProject.id,
          members: {
            create: [
              { userId: byronUser.id },
              { userId: bob.id },
            ],
          },
        },
      }),
    ]);

    console.log(`✅ Created ${conversations.length} conversations\n`);

    // 5. Add sample messages
    console.log('💌 Creating sample messages...');
    
    await Promise.all([
      // Team General messages
      prisma.message.create({
        data: {
          content: `Hey team! Welcome to the Website Redesign project. Let's make this amazing! 🚀`,
          senderId: byronUser.id,
          conversationId: conversations[0].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'Excited to be here! Ready to collaborate on this project.',
          senderId: alice.id,
          conversationId: conversations[0].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'Looking forward to working with everyone! 👍',
          senderId: bob.id,
          conversationId: conversations[0].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'This is going to be great! Count me in.',
          senderId: charlie.id,
          conversationId: conversations[0].id,
        },
      }),
      // Frontend Team messages
      prisma.message.create({
        data: {
          content: 'Frontend team, let\'s discuss the component architecture.',
          senderId: byronUser.id,
          conversationId: conversations[1].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'I can work on the design system and UI components.',
          senderId: alice.id,
          conversationId: conversations[1].id,
        },
      }),
      // Direct messages
      prisma.message.create({
        data: {
          content: 'Hey Alice, can you review the mockups when you have time?',
          senderId: byronUser.id,
          conversationId: conversations[2].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'Sure! I\'ll take a look this afternoon.',
          senderId: alice.id,
          conversationId: conversations[2].id,
        },
      }),
    ]);

    console.log('✅ Created sample messages\n');

    // 6. Display summary
    console.log('🎉 Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Project: ${websiteProject.title} (ID: ${websiteProject.id})`);
    console.log(`   Owner: ${byronUser.name} (${byronUser.email})`);
    console.log(`   Members added: 4 (Alice, Bob, Charlie, Diana)`);
    console.log(`   Conversations created: ${conversations.length}`);
    console.log(`   Messages created: 8`);
    console.log('');
    console.log('✨ Test Users (all with password: "password123"):');
    console.log(`   - ${byronUser.email} (Project Owner)`);
    console.log(`   - alice.johnson@taskify.com`);
    console.log(`   - bob.smith@taskify.com`);
    console.log(`   - charlie.brown@taskify.com`);
    console.log(`   - diana.prince@taskify.com`);
    console.log('');
    console.log('🧪 To test:');
    console.log('   1. Login with any of the emails above');
    console.log('   2. Open the "Website Redesign" project');
    console.log('   3. Click the Messages tab');
    console.log('   4. You should see all team members available to chat!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMessagingData();

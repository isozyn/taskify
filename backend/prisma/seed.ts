import { PrismaClient } from '@prisma/client';

declare const process: any;

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // 1. Create Users
    console.log('📝 Creating users...');
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'byron@taskify.com' },
        update: {},
        create: {
          name: 'Byron Young',
          email: 'byron@taskify.com',
          username: 'byron',
          password: '$2b$10$8DY8G8aeK9n5WDX5R5ZUC.NE5lVZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
          role: 'USER',
          isEmailVerified: true,
        },
      }),
      prisma.user.upsert({
        where: { email: 'alice@taskify.com' },
        update: {},
        create: {
          name: 'Alice Johnson',
          email: 'alice@taskify.com',
          username: 'alice',
          password: '$2b$10$8DY8G8aeK9n5WDX5R5ZUC.NE5lVZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
          role: 'USER',
          isEmailVerified: true,
        },
      }),
      prisma.user.upsert({
        where: { email: 'bob@taskify.com' },
        update: {},
        create: {
          name: 'Bob Smith',
          email: 'bob@taskify.com',
          username: 'bob',
          password: '$2b$10$8DY8G8aeK9n5WDX5R5ZUC.NE5lVZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
          role: 'USER',
          isEmailVerified: true,
        },
      }),
      prisma.user.upsert({
        where: { email: 'charlie@taskify.com' },
        update: {},
        create: {
          name: 'Charlie Brown',
          email: 'charlie@taskify.com',
          username: 'charlie',
          password: '$2b$10$8DY8G8aeK9n5WDX5R5ZUC.NE5lVZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
          role: 'USER',
          isEmailVerified: true,
        },
      }),
    ]);
    console.log(`✅ Created ${users.length} users\n`);

    const [byron, alice, bob, charlie] = users;

    // 2. Create Projects
    console.log('🏗️  Creating projects...');
    const projects = await Promise.all([
      prisma.project.upsert({
        where: { id: 1 },
        update: {},
        create: {
          id: 1,
          title: 'Website Redesign',
          description: 'Complete redesign of the company website with modern UI/UX',
          ownerId: byron.id,
          status: 'ACTIVE',
          workflowType: 'CUSTOM',
          color: '#3B82F6',
        },
      }),
      prisma.project.upsert({
        where: { id: 2 },
        update: {},
        create: {
          id: 2,
          title: 'Mobile App Development',
          description: 'Build a native mobile app for iOS and Android',
          ownerId: byron.id,
          status: 'ACTIVE',
          workflowType: 'CUSTOM',
          color: '#8B5CF6',
        },
      }),
      prisma.project.upsert({
        where: { id: 3 },
        update: {},
        create: {
          id: 3,
          title: 'Marketing Campaign Q4',
          description: 'Launch Q4 marketing campaign and track results',
          ownerId: alice.id,
          status: 'ACTIVE',
          workflowType: 'AUTOMATED',
          color: '#EC4899',
        },
      }),
    ]);
    console.log(`✅ Created ${projects.length} projects\n`);

    // 3. Add Project Members
    console.log('👥 Adding project members...');
    await Promise.all([
      // Project 1 members
      prisma.projectMember.upsert({
        where: { userId_projectId: { projectId: projects[0].id, userId: alice.id } },
        update: {},
        create: { projectId: projects[0].id, userId: alice.id, role: 'MEMBER' as any },
      }),
      prisma.projectMember.upsert({
        where: { userId_projectId: { projectId: projects[0].id, userId: bob.id } },
        update: {},
        create: { projectId: projects[0].id, userId: bob.id, role: 'MEMBER' as any },
      }),
      prisma.projectMember.upsert({
        where: { userId_projectId: { projectId: projects[0].id, userId: charlie.id } },
        update: {},
        create: { projectId: projects[0].id, userId: charlie.id, role: 'MEMBER' as any },
      }),
      // Project 2 members
      prisma.projectMember.upsert({
        where: { userId_projectId: { projectId: projects[1].id, userId: alice.id } },
        update: {},
        create: { projectId: projects[1].id, userId: alice.id, role: 'MEMBER' as any },
      }),
      prisma.projectMember.upsert({
        where: { userId_projectId: { projectId: projects[1].id, userId: bob.id } },
        update: {},
        create: { projectId: projects[1].id, userId: bob.id, role: 'MEMBER' as any },
      }),
      prisma.projectMember.upsert({
        where: { userId_projectId: { projectId: projects[1].id, userId: charlie.id } },
        update: {},
        create: { projectId: projects[1].id, userId: charlie.id, role: 'MEMBER' as any },
      }),
      // Project 3 members
      prisma.projectMember.upsert({
        where: { userId_projectId: { projectId: projects[2].id, userId: byron.id } },
        update: {},
        create: { projectId: projects[2].id, userId: byron.id, role: 'MEMBER' as any },
      }),
      prisma.projectMember.upsert({
        where: { userId_projectId: { projectId: projects[2].id, userId: bob.id } },
        update: {},
        create: { projectId: projects[2].id, userId: bob.id, role: 'MEMBER' as any },
      }),
      prisma.projectMember.upsert({
        where: { userId_projectId: { projectId: projects[2].id, userId: charlie.id } },
        update: {},
        create: { projectId: projects[2].id, userId: charlie.id, role: 'MEMBER' as any },
      }),
    ]);
    console.log('✅ Added project members\n');

    // 4. Create Conversations
    console.log('💬 Creating conversations...');
    const conversations = await Promise.all([
      // Project 1 conversations
      prisma.conversation.create({
        data: {
          name: 'Website Redesign General',
          type: 'GROUP',
          projectId: projects[0].id,
          members: {
            create: [
              { userId: byron.id },
              { userId: alice.id },
              { userId: bob.id },
              { userId: charlie.id },
            ],
          },
        },
      }),
      prisma.conversation.create({
        data: {
          name: 'Frontend Team',
          type: 'GROUP',
          projectId: projects[0].id,
          members: {
            create: [
              { userId: byron.id },
              { userId: alice.id },
              { userId: bob.id },
            ],
          },
        },
      }),
      prisma.conversation.create({
        data: {
          name: 'Byron & Alice Chat',
          type: 'DIRECT',
          projectId: projects[0].id,
          members: {
            create: [
              { userId: byron.id },
              { userId: alice.id },
            ],
          },
        },
      }),
      // Project 2 conversations
      prisma.conversation.create({
        data: {
          name: 'Mobile App General',
          type: 'GROUP',
          projectId: projects[1].id,
          members: {
            create: [
              { userId: byron.id },
              { userId: alice.id },
              { userId: bob.id },
              { userId: charlie.id },
            ],
          },
        },
      }),
      prisma.conversation.create({
        data: {
          name: 'iOS Development',
          type: 'GROUP',
          projectId: projects[1].id,
          members: {
            create: [
              { userId: alice.id },
              { userId: bob.id },
            ],
          },
        },
      }),
      prisma.conversation.create({
        data: {
          name: 'Android Development',
          type: 'GROUP',
          projectId: projects[1].id,
          members: {
            create: [
              { userId: alice.id },
              { userId: charlie.id },
            ],
          },
        },
      }),
      // Project 3 conversations
      prisma.conversation.create({
        data: {
          name: 'Marketing Team Chat',
          type: 'GROUP',
          projectId: projects[2].id,
          members: {
            create: [
              { userId: alice.id },
              { userId: byron.id },
              { userId: bob.id },
              { userId: charlie.id },
            ],
          },
        },
      }),
    ]);
    console.log(`✅ Created ${conversations.length} conversations\n`);

    // 5. Create Sample Messages
    console.log('💌 Creating sample messages...');
    await Promise.all([
      prisma.message.create({
        data: {
          content: "Hey team! Let's kick off the website redesign. I've prepared a design mockup.",
          senderId: byron.id,
          conversationId: conversations[0].id,
        },
      }),
      prisma.message.create({
        data: {
          content: "Great! I've reviewed the mockups. The color scheme looks amazing! 🎨",
          senderId: alice.id,
          conversationId: conversations[0].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'I can start working on the responsive design for mobile. Should we use Tailwind CSS?',
          senderId: bob.id,
          conversationId: conversations[0].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'Yes, Tailwind CSS is perfect for this project. Let\'s also implement dark mode support.',
          senderId: byron.id,
          conversationId: conversations[0].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'I can help with the dark mode implementation. Count me in! 👍',
          senderId: charlie.id,
          conversationId: conversations[0].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'Frontend team, let\'s sync up on the component library setup.',
          senderId: byron.id,
          conversationId: conversations[1].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'I started setting up Storybook for component documentation.',
          senderId: alice.id,
          conversationId: conversations[1].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'Great! I\'ll work on creating the base components next.',
          senderId: bob.id,
          conversationId: conversations[1].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'Hi Alice! How are the design revisions coming along?',
          senderId: byron.id,
          conversationId: conversations[2].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'Hi Byron! Almost done. I\'ll send them over by end of day.',
          senderId: alice.id,
          conversationId: conversations[2].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'Perfect! No rush. Let\'s review them together tomorrow.',
          senderId: byron.id,
          conversationId: conversations[2].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'Mobile app project is officially live! Let\'s build something amazing together.',
          senderId: byron.id,
          conversationId: conversations[3].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'Excited to get started! I\'ve set up the React Native environment.',
          senderId: alice.id,
          conversationId: conversations[3].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'I\'m working on the backend API. Should be ready by end of week.',
          senderId: bob.id,
          conversationId: conversations[3].id,
        },
      }),
      prisma.message.create({
        data: {
          content: 'I can handle the database schema design. Let me know what we need!',
          senderId: charlie.id,
          conversationId: conversations[3].id,
        },
      }),
    ]);
    console.log('✅ Created sample messages\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Projects: ${projects.length}`);
    console.log(`   - Conversations: ${conversations.length}`);
    console.log(`   - Messages: 15\n`);
    console.log('✨ You can now test the messaging system!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();

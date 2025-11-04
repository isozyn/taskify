import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

declare const process: any;

const prisma = new PrismaClient();

async function seedProjectMembers() {
  try {
    console.log('🌱 Seeding multiple project members...\n');

    // 1. Find Byron's user account
    const byronUser = await prisma.user.findUnique({
      where: { email: 'devbybyron@gmail.com' },
    });

    if (!byronUser) {
      console.log('❌ Byron user (devbybyron@gmail.com) not found');
      console.log('💡 Please make sure Byron is registered in the system');
      return;
    }

    console.log(`✅ Found Byron: ${byronUser.name} (ID: ${byronUser.id})\n`);

    // 2. Find or create the Website Redesign project
    let websiteProject = await prisma.project.findFirst({
      where: {
        ownerId: byronUser.id,
        title: {
          contains: 'Website Redesign',
        },
      },
    });

    if (!websiteProject) {
      console.log('📋 Creating Website Redesign project...');
      websiteProject = await prisma.project.create({
        data: {
          title: 'Website Redesign',
          description: 'Complete redesign of the company website with modern UI/UX',
          status: 'ACTIVE',
          ownerId: byronUser.id,
          workflowType: 'CUSTOM',
        },
      });
      console.log(`✅ Created project: ${websiteProject.title} (ID: ${websiteProject.id})\n`);
    } else {
      console.log(`✅ Found project: ${websiteProject.title} (ID: ${websiteProject.id})\n`);
    }

    // 3. Create password hash for all test users
    const properPasswordHash = await bcrypt.hash('password123', 10);
    console.log('🔐 Generated password hash for "password123"\n');

    // 4. Create multiple team members
    console.log('👥 Creating team members...\n');

    const teamMembers = [
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@taskify.com',
        username: 'alice_johnson',
        role: 'Frontend Developer',
      },
      {
        name: 'Bob Smith',
        email: 'bob.smith@taskify.com',
        username: 'bob_smith',
        role: 'Backend Developer',
      },
      {
        name: 'Charlie Brown',
        email: 'charlie.brown@taskify.com',
        username: 'charlie_brown',
        role: 'UI/UX Designer',
      },
      {
        name: 'Diana Prince',
        email: 'diana.prince@taskify.com',
        username: 'diana_prince',
        role: 'Product Manager',
      },
      {
        name: 'Ethan Hunt',
        email: 'ethan.hunt@taskify.com',
        username: 'ethan_hunt',
        role: 'DevOps Engineer',
      },
      {
        name: 'Fiona Davis',
        email: 'fiona.davis@taskify.com',
        username: 'fiona_davis',
        role: 'QA Engineer',
      },
      {
        name: 'George Miller',
        email: 'george.miller@taskify.com',
        username: 'george_miller',
        role: 'Fullstack Developer',
      },
      {
        name: 'Hannah Lee',
        email: 'hannah.lee@taskify.com',
        username: 'hannah_lee',
        role: 'Content Writer',
      },
    ];

    const createdUsers = [];

    for (const member of teamMembers) {
      const user = await prisma.user.upsert({
        where: { email: member.email },
        update: {},
        create: {
          name: member.name,
          email: member.email,
          username: member.username,
          password: properPasswordHash,
          role: 'USER',
          isEmailVerified: true,
        },
      });

      createdUsers.push({ ...user, roleDescription: member.role });
      console.log(`  ✓ ${member.name} - ${member.role}`);
    }

    console.log(`\n✅ Created/Updated ${createdUsers.length} team members\n`);

    // 5. Add all users as members to the Website Redesign project
    console.log('📋 Adding members to Website Redesign project...\n');

    let addedCount = 0;

    for (const user of createdUsers) {
      await prisma.projectMember.upsert({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId: websiteProject.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          projectId: websiteProject.id,
          role: 'MEMBER',
        },
      });
      
      console.log(`  ✓ Added ${user.name} to project`);
      addedCount++;
    }

    console.log(`\n✅ Added ${addedCount} members to the project\n`);

    // 6. Display summary
    console.log('🎉 Seeding completed successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Project: ${websiteProject.title}`);
    console.log(`   Project ID: ${websiteProject.id}`);
    console.log(`   Owner: ${byronUser.name} (${byronUser.email})`);
    console.log(`   Team Members: ${addedCount}`);
    console.log('');
    console.log('👥 TEAM MEMBERS (all with password: "password123"):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   🔵 ${byronUser.email} - Project Owner`);
    
    for (const user of createdUsers) {
      console.log(`   🟢 ${user.email} - ${user.roleDescription}`);
    }
    
    console.log('');
    console.log('🧪 TO TEST MESSAGING:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   1. Login with any email above (password: "password123")');
    console.log('   2. Navigate to "Website Redesign" project');
    console.log('   3. Click the "Messages" tab');
    console.log(`   4. Click the "+" button to see all ${addedCount} team members`);
    console.log('   5. Select any member to start a direct message');
    console.log('   6. Send messages and test real-time functionality!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedProjectMembers();

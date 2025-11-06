// Script to delete users from the database
// Usage: npx ts-node scripts/delete-user.ts <email>

import prisma from '../src/config/db';

const deleteUser = async (email: string) => {
  try {
    // First, check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
      },
    });

    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      return;
    }

    console.log('Found user:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Username: ${user.username}`);
    console.log('');

    // Delete the user (cascade will handle related records)
    await prisma.user.delete({
      where: { email },
    });

    console.log(`✅ Successfully deleted user: ${email}`);
  } catch (error) {
    console.error('❌ Error deleting user:', error);
  } finally {
    await prisma.$disconnect();
  }
};

const listUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`\n📋 Total users: ${users.length}\n`);
    
    users.forEach((user) => {
      console.log(`ID: ${user.id} | ${user.name} (${user.email})`);
      console.log(`  Username: ${user.username} | Role: ${user.role} | Verified: ${user.isEmailVerified}`);
      console.log(`  Created: ${user.createdAt.toLocaleString()}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    await prisma.$disconnect();
  }
};

const deleteAllUsers = async () => {
  try {
    const result = await prisma.user.deleteMany({});
    console.log(`✅ Successfully deleted ${result.count} user(s)`);
  } catch (error) {
    console.error('❌ Error deleting users:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Main execution
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('Usage:');
    console.log('  npm run delete-user <email>     - Delete a specific user');
    console.log('  npm run delete-user list        - List all users');
    console.log('  npm run delete-user all         - Delete all users');
    console.log('');
    console.log('Examples:');
    console.log('  npm run delete-user test@example.com');
    console.log('  npm run delete-user list');
    return;
  }

  if (command === 'list') {
    await listUsers();
  } else if (command === 'all') {
    console.log('⚠️  WARNING: This will delete ALL users!');
    console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await deleteAllUsers();
  } else {
    await deleteUser(command);
  }
};

main();

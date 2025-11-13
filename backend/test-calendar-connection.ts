// Quick diagnostic script to test Google Calendar connection
// Run with: npx ts-node test-calendar-connection.ts

import prisma from './src/config/db';
import { GoogleCalendarService } from './src/services/googleCalendarService';

async function testCalendarConnection() {
  console.log('🔍 Google Calendar Connection Diagnostic\n');
  
  try {
    // Get a user with Google tokens (adjust email as needed)
    const userEmail = process.argv[2];
    
    if (!userEmail) {
      console.log('❌ Please provide a user email:');
      console.log('   npx ts-node test-calendar-connection.ts your-email@example.com\n');
      process.exit(1);
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
        calendarSyncEnabled: true,
      },
    });

    if (!user) {
      console.log(`❌ User not found: ${userEmail}\n`);
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('📊 Token Status:');
    console.log(`   - Access Token: ${user.googleAccessToken ? '✅ Present' : '❌ Missing'}`);
    console.log(`   - Refresh Token: ${user.googleRefreshToken ? '✅ Present' : '❌ Missing'}`);
    console.log(`   - Token Expiry: ${user.googleTokenExpiry || 'Not set'}`);
    console.log(`   - Calendar Sync: ${user.calendarSyncEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log('');

    if (!user.googleAccessToken || !user.googleRefreshToken) {
      console.log('❌ Missing OAuth tokens. User needs to sign in with Google.\n');
      console.log('Steps to fix:');
      console.log('1. Go to your app and sign in with Google');
      console.log('2. Make sure you approve all permissions (including Calendar access)');
      console.log('3. Run this script again\n');
      process.exit(1);
    }

    // Test calendar connection
    console.log('🔄 Testing calendar connection...');
    const isConnected = await GoogleCalendarService.isCalendarConnected(user.id);
    console.log(`   Calendar Connected: ${isConnected ? '✅ Yes' : '❌ No'}`);

    if (!isConnected) {
      console.log('\n❌ Calendar not connected. Please re-authenticate with Google.\n');
      process.exit(1);
    }

    // Try to fetch calendar events
    console.log('\n📅 Fetching calendar events...');
    const events = await GoogleCalendarService.getCalendarEvents(user.id);
    
    console.log(`   Found ${events.length} events\n`);
    
    if (events.length === 0) {
      console.log('ℹ️  No events found. This could mean:');
      console.log('   1. Your calendar is empty');
      console.log('   2. No events in the current time range');
      console.log('   3. Calendar API permissions issue\n');
    } else {
      console.log('📋 Recent events:');
      events.slice(0, 5).forEach((event: any) => {
        console.log(`   - ${event.summary || 'Untitled'} (${event.start?.dateTime || event.start?.date})`);
      });
      console.log('');
    }

    // Check if user has any tasks
    const tasks = await prisma.task.findMany({
      where: { 
        project: {
          members: {
            some: { userId: user.id }
          }
        }
      },
      take: 5,
    });

    console.log(`📝 User has ${tasks.length} tasks`);
    if (tasks.length > 0) {
      console.log('   Recent tasks:');
      tasks.forEach(task => {
        console.log(`   - ${task.title} (Calendar Event ID: ${task.googleCalendarEventId || 'Not synced'})`);
      });
    }
    console.log('');

    console.log('✅ Diagnostic complete!\n');
    
  } catch (error: any) {
    console.error('\n❌ Error during diagnostic:', error.message);
    console.error('\nFull error:', error);
    console.log('\n🔧 Common fixes:');
    console.log('1. Make sure Google Calendar API is enabled in Google Cloud Console');
    console.log('2. Verify OAuth scopes include calendar access');
    console.log('3. Check that tokens haven\'t expired (re-authenticate if needed)');
    console.log('4. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct in .env\n');
  } finally {
    await prisma.$disconnect();
  }
}

testCalendarConnection();

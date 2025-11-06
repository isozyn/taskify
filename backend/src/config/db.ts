// Prisma client initialization with connection pooling and error handling

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Connection retry logic
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const connectWithRetry = async () => {
  try {
    await prisma.$connect();
    isConnected = true;
    reconnectAttempts = 0;
    console.log('✅ Database connected successfully');
  } catch (error) {
    isConnected = false;
    reconnectAttempts++;
    console.error(`❌ Database connection failed (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}):`, error);
    
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      console.log(`⏳ Retrying connection in ${reconnectAttempts * 2} seconds...`);
      setTimeout(() => connectWithRetry(), reconnectAttempts * 2000);
    } else {
      console.error('❌ Max reconnection attempts reached. Please check your database connection.');
      process.exit(1);
    }
  }
};

// Initial connection
connectWithRetry();

// Monitor connection health
setInterval(async () => {
  if (isConnected) {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      console.error('⚠️ Database connection lost. Attempting to reconnect...');
      isConnected = false;
      reconnectAttempts = 0;
      connectWithRetry();
    }
  }
}, 30000); // Check every 30 seconds

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log('🔌 Disconnecting from database...');
  await prisma.$disconnect();
  isConnected = false;
  console.log('✅ Database disconnected successfully');
};

process.on('beforeExit', gracefulShutdown);
process.on('SIGINT', async () => {
  await gracefulShutdown();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await gracefulShutdown();
  process.exit(0);
});

export default prisma;

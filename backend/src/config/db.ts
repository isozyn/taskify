// Prisma client initialization with connection pooling and error handling

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
	log:
		process.env.NODE_ENV === "development"
			? ["query", "error", "warn"]
			: ["error"],
	errorFormat: "pretty",
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
	} catch (error) {
		isConnected = false;
		reconnectAttempts++;
		// Database connection failed
		if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
			setTimeout(() => connectWithRetry(), reconnectAttempts * 2000);
		} else {
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
			isConnected = false;
			reconnectAttempts = 0;
			connectWithRetry();
		}
	}
}, 30000); // Check every 30 seconds

// Handle graceful shutdown
const gracefulShutdown = async () => {
	await prisma.$disconnect();
	isConnected = false;
};

process.on("beforeExit", gracefulShutdown);
process.on("SIGINT", async () => {
	await gracefulShutdown();
	process.exit(0);
});
process.on("SIGTERM", async () => {
	await gracefulShutdown();
	process.exit(0);
});

export default prisma;

const { PrismaClient } = require("@prisma/client");

let prisma;

// Check if running in development mode
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Use a global instance in development to prevent multiple instances
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma;

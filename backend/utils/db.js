const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Prisma
const prisma = new PrismaClient();

// Redis disabled for Render deployment without Redis service
const redis = {
  get: async () => null,
  set: async () => null,
  del: async () => null
};

module.exports = { prisma, redis };
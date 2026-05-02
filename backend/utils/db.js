const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => console.log('🟢 Redis Connected'));
redis.on('error', (err) => console.error('🔴 Redis Error:', err));

module.exports = { prisma, redis };
import { PrismaClient } from '../../prisma/generated-client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://root:password@localhost:5432/ketoan?schema=public';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const pool = globalForPrisma.pool ?? new Pool({ connectionString });

const prismaClientFactory = () => {
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Trong môi trường dev, thỉnh thoảng ta cần force tạo mới khi schema thay đổi 
// (đặc biệt khi dùng Turbopack/Next.js cache bộ nhớ)
export const prisma = process.env.NODE_ENV === 'development'
  ? prismaClientFactory()
  : (globalForPrisma.prisma ?? prismaClientFactory());

// Add a dummy version to force module reload: v4
console.log('[Prisma] Client loaded at: ' + new Date().toISOString());
console.log('[Prisma] Available models:', Object.keys(prisma).filter(k => k.startsWith('ext_')));

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

export default prisma;


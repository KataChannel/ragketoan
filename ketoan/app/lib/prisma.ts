import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://root:password@localhost:5432/ketoan?schema=public';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Create PostgreSQL connection pool
const pool = globalForPrisma.pool ?? new Pool({ connectionString });

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
const prismaClientFactory = () => {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = (() => {
  let instance = globalForPrisma.prisma ?? prismaClientFactory();
  
  // Kiểm tra thực tế xem model có tồn tại không
  const hasModel = 'ext_sanpham_dictionary' in instance;
  
  if (process.env.NODE_ENV === 'development' && !hasModel) {
    instance = prismaClientFactory();
  }
  return instance;
})();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

export default prisma;


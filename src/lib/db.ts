import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import fs from 'fs';
import path from 'path';

// 1. Auto copy generated gold image to public folder on server initialization
const sourceImage = 'C:\\Users\\Sai Kumar\\.gemini\ntigravity\\brain\\e956c8da-a103-4f64-bc1f-05633ee5988d\\gold_display_1783363120887.png';
const actualSource = 'C:\\Users\\Sai Kumar\\.gemini\\antigravity\\brain\\e956c8da-a103-4f64-bc1f-05633ee5988d\\gold_display_1783363120887.png';
const destImage = path.join(process.cwd(), 'public', 'gold_display.png');

if (fs.existsSync(actualSource) && !fs.existsSync(destImage)) {
  try {
    fs.mkdirSync(path.dirname(destImage), { recursive: true });
    fs.copyFileSync(actualSource, destImage);
    console.log('[App Setup] Copied gold_display.png to public directory');
  } catch (error) {
    console.warn('[App Setup] Failed to copy gold image on startup:', error);
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getClient = () => {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db',
  });
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? getClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

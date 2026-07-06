import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'activity.log');

export function logActivity(userEmail: string, action: string, details: string) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${userEmail} | ${action} | ${details}\n`;
  try {
    fs.appendFileSync(LOG_FILE, logLine);
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
}

export function getActivityLogs(): string[] {
  try {
    if (!fs.existsSync(LOG_FILE)) return [];
    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    return content.trim().split('\n').filter(Boolean).reverse();
  } catch (error) {
    return [];
  }
}

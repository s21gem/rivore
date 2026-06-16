import cron from 'node-cron';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import BackupLog from '../models/BackupLog';

// Ensure backup directory exists
const backupDir = path.join(process.cwd(), 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

export const generateBackup = async (trigger: 'automated' | 'manual' = 'automated') => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.zip`;
    const backupFilePath = path.join(backupDir, backupFileName);

    const output = fs.createWriteStream(backupFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.pipe(output);

    // Get all collections
    const collections = mongoose.connection.collections;
    
    for (const [name, collection] of Object.entries(collections)) {
      const data = await collection.find({}).toArray();
      archive.append(JSON.stringify(data, null, 2), { name: `${name}.json` });
    }

    await archive.finalize();

    // Log the backup
    await BackupLog.create({
      filename: backupFileName,
      sizeBytes: archive.pointer(),
      status: 'success',
      type: trigger === 'automated' ? 'daily' : 'manual',
    });

    console.log(`[Backup] Created successfully: ${backupFileName}`);
    return backupFilePath;

  } catch (error: any) {
    console.error('[Backup] Failed to generate backup:', error);
    await BackupLog.create({
      filename: 'unknown',
      sizeBytes: 0,
      status: 'failed',
      type: trigger === 'automated' ? 'daily' : 'manual',
      errorDetails: error.message || 'Unknown error'
    });
    throw error;
  }
};

export const startBackupCron = () => {
  // Run daily at 3:00 AM
  cron.schedule('0 3 * * *', () => {
    console.log('[Backup Cron] Starting automated daily backup...');
    generateBackup('automated');
  });
};

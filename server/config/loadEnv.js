import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dns from 'dns';

const __dirname = dirname(fileURLToPath(import.meta.url));

const serverEnv = join(__dirname, '..', '.env');
const rootEnv = join(__dirname, '..', '..', '.env');

if (fs.existsSync(serverEnv)) {
  dotenv.config({ path: serverEnv });
} else if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
} else {
  dotenv.config();
}

if (!process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log('Using Google/Cloudflare public DNS for local MongoDB resolution.');
  } catch (err) {
    console.warn('Warning: Failed to set custom DNS servers:', err.message);
  }
}

import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// __dirname resolves to the scripts/ folder under project root
const rootDir = path.join(__dirname, '..');
const clientDist = path.join(rootDir, 'client', 'dist');
const rootPublic = path.join(rootDir, 'public');

// Helper to copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(clientDist)) {
  // Clear root public if it exists
  fs.rmSync(rootPublic, { recursive: true, force: true });
  copyDir(clientDist, rootPublic);
  console.log('Successfully copied client/dist to root public');
} else {
  console.error(`Error: client/dist does not exist at "${clientDist}"! Cannot copy to root public.`);
  process.exit(1);
}

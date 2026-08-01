import fs from 'fs';
import path from 'path';

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

const clientDist = path.join(process.cwd(), 'client', 'dist');
const rootDist = path.join(process.cwd(), 'dist');

if (fs.existsSync(clientDist)) {
  // Clear root dist if it exists
  fs.rmSync(rootDist, { recursive: true, force: true });
  copyDir(clientDist, rootDist);
  console.log('Successfully copied client/dist to root dist');
} else {
  console.error('Error: client/dist does not exist! Cannot copy to root dist.');
  process.exit(1);
}

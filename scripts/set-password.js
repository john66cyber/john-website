// Sets (or resets) the passcode for the personal dashboard.
// Usage: npm run set-password -- yourNewPassword

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run set-password -- yourNewPassword');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 64).toString('hex');
const stored = `${salt}:${hash}`;

const envPath = path.join(__dirname, '..', '.env');
let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

function upsertLine(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) return content.replace(regex, `${key}=${value}`);
  return content + (content.endsWith('\n') || content === '' ? '' : '\n') + `${key}=${value}\n`;
}

envContent = upsertLine(envContent, 'ADMIN_PASSWORD_HASH', stored);

if (!/^JWT_SECRET=.+$/m.test(envContent)) {
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  envContent = upsertLine(envContent, 'JWT_SECRET', jwtSecret);
}

if (!/^PORT=.+$/m.test(envContent)) {
  envContent = upsertLine(envContent, 'PORT', '3000');
}

fs.writeFileSync(envPath, envContent.trim() + '\n');
console.log('Passcode set. .env has been written.');
console.log('Keep .env private — never commit it or share it with anyone.');

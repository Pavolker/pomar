import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const targetPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'env-config.js');
const content = `window.GEMINI_API_KEY = ${JSON.stringify(key)};\n`;
writeFileSync(targetPath, content, 'utf8');
console.log(`Generated env-config.js with ${key ? 'provided' : 'empty'} Gemini key`);

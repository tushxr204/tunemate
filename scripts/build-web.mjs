// Copies the website into www/ for the Android and iOS apps.
// Usage: TUNEMATE_SITE=https://your-app.vercel.app npm run build:web
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const site = String(process.env.TUNEMATE_SITE || '').trim().replace(/\/+$/, '');
if (!/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(site)) {
  console.warn('\n⚠️  TUNEMATE_SITE is not set (or not an https address).');
  console.warn('   The phone app will open in demo mode. Example: TUNEMATE_SITE=https://tunemate-tushar.vercel.app\n');
}

rmSync('www', { recursive: true, force: true });
mkdirSync('www/vendor', { recursive: true });
for (const f of ['index.html', 'app.js', 'manifest.webmanifest']) cpSync(f, `www/${f}`);
cpSync('icons', 'www/icons', { recursive: true });

writeFileSync('www/app-config.js', `window.TUNEMATE_SITE = ${JSON.stringify(/^https:/.test(site) ? site : '')};\n`);

// Bundle supabase-js inside the app so it starts even on a slow connection.
let html = readFileSync('www/index.html', 'utf8');
const umd = 'node_modules/@supabase/supabase-js/dist/umd/supabase.js';
if (existsSync(umd)) {
  cpSync(umd, 'www/vendor/supabase.js');
  html = html.replace('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', 'vendor/supabase.js');
} else {
  console.warn('supabase-js not found in node_modules, the app will load it from the CDN.');
}
// Paths must be relative inside the app.
html = html.replaceAll('href="/manifest.webmanifest"', 'href="manifest.webmanifest"')
           .replaceAll('href="/icons/', 'href="icons/');
writeFileSync('www/index.html', html);
console.log(`✅ www/ ready${site ? ' for ' + site : ''}`);

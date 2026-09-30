const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('\x1b[32m%s\x1b[0m', '========================================================================');
console.log('\x1b[32m%s\x1b[0m', 'USE IT FIRST (UIF) — FULL-STACK ALL-IN-ONE DEV RUNNER');
console.log('\x1b[32m%s\x1b[0m', '========================================================================');
console.log('  📱 \x1b[1mWeb Simulator:\x1b[0m   \x1b[36mhttp://localhost:3000\x1b[0m');
console.log('  ⚙️  \x1b[1mBackend Fastify:\x1b[0m \x1b[36mhttp://localhost:8080\x1b[0m');
console.log('  🩺 \x1b[1mAPI Health:\x1b[0m      \x1b[36mhttp://localhost:8080/health\x1b[0m');
console.log('\x1b[32m%s\x1b[0m', '========================================================================');
console.log('\x1b[90mStarting both servers concurrently... Press Ctrl+C to terminate both.\x1b[0m\n');

// 1. Start Web Simulator
const webProcess = spawn(process.execPath, ['preview/server.js'], {
  cwd: rootDir,
  stdio: ['inherit', 'pipe', 'pipe'],
});

webProcess.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line) console.log('\x1b[32m[WEB 3000]\x1b[0m ' + line);
  });
});

webProcess.stderr.on('data', (data) => {
  console.error('\x1b[31m[WEB ERR]\x1b[0m ' + data.toString().trim());
});

// 2. Start Backend API Server
const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const backendProcess = spawn(npmBin, ['run', 'dev', '--prefix', 'backend'], {
  cwd: rootDir,
  stdio: ['inherit', 'pipe', 'pipe'],
});

backendProcess.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line) console.log('\x1b[34m[API 8080]\x1b[0m ' + line);
  });
});

backendProcess.stderr.on('data', (data) => {
  console.error('\x1b[33m[API ERR]\x1b[0m ' + data.toString().trim());
});

function cleanup() {
  console.log('\n\x1b[33mShutting down all UIF servers...\x1b[0m');
  try {
    webProcess.kill();
  } catch (e) {}
  try {
    backendProcess.kill();
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

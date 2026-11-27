import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const incoming = process.argv.slice(2);
const args = [];
for (let index = 0; index < incoming.length; index += 1) {
  const argument = incoming[index];
  if (argument === '--host') {
    args.push('--hostname');
    if (incoming[index + 1] && !incoming[index + 1].startsWith('--')) args.push(incoming[++index]);
  } else if (argument === '--strictPort') {
    continue;
  } else {
    args.push(argument);
  }
}

const next = spawn(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'dev', ...args], { stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => next.kill(signal));
next.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});

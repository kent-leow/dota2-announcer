#!/usr/bin/env node
const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const bump = process.argv[2];
if (!bump || !['major', 'minor', 'hotfix'].includes(bump)) {
  console.error('Usage: npm run release -- <major|minor|hotfix>');
  process.exit(1);
}

const pkgPath = resolve(__dirname, '../application/package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);

let version;
if (bump === 'major') version = `${major + 1}.0.0`;
else if (bump === 'minor') version = `${major}.${minor + 1}.0`;
else version = `${major}.${minor}.${patch + 1}`;

const run = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
};

pkg.version = version;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Updated application/package.json to ${version}`);

const lockPath = resolve(__dirname, '../application/package-lock.json');
const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
lock.version = version;
if (lock.packages?.['']) lock.packages[''].version = version;
writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
console.log(`Updated application/package-lock.json to ${version}`);

run('git add application/package.json application/package-lock.json');
run(`git commit -m "chore: bump version to ${version}"`);
run(`git tag v${version}`);
run(`git push origin main v${version}`);

console.log(`\n✅ Released v${version} — pipeline will build and publish.`);

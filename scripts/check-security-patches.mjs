import { execSync } from 'child_process';

const patches = [
    { name: 'react', version: '19.2.3' },
    { name: 'react-dom', version: '19.2.3' },
    { name: 'next', version: '16.1.4' }
];

console.log('--- Security Patch Watcher (SCAN-2026-001) ---');
console.log(`Checking npm for patched versions at ${new Date().toLocaleString()}...`);

const isStrict = process.argv.includes('--strict') || process.env.STRICT === 'true';
let allAvailable = true;

for (const patch of patches) {
    try {
        const result = execSync(`npm view ${patch.name}@${patch.version} version 2>/dev/null`).toString().trim();
        if (result === patch.version) {
            console.log(`✅ [AVAILABLE] ${patch.name}@${patch.version} has been released!`);
        } else {
            console.log(`❌ [PENDING]   ${patch.name}@${patch.version} is not yet available.`);
            allAvailable = false;
        }
    } catch (e) {
        console.log(`❌ [PENDING]   ${patch.name}@${patch.version} is not yet available.`);
        allAvailable = false;
    }
}

if (allAvailable) {
    console.log('\n🚀 ALL PATCHES ARE AVAILABLE! Run implementation plan immediately.');
    process.exit(0);
} else {
    console.log('\n⏳ Some patches are still missing. Re-check later.');
    process.exit(isStrict ? 1 : 0);
}

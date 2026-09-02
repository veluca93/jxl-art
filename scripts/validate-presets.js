#!/usr/bin/env node
/**
 * Validate all presets by running them through jxl_from_tree CLI
 */

import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectDir = join(__dirname, '..');

// Check for jxl_from_tree
try {
  execSync('which jxl_from_tree', { stdio: 'pipe' });
} catch {
  console.error('Error: jxl_from_tree not found. Install libjxl: brew install libjxl');
  process.exit(1);
}

// Import presets (extract from TS file)
const presetsFile = readFileSync(join(projectDir, 'src/lib/presets.ts'), 'utf-8');

// Simple extraction of presets from TS file
const presetMatches = presetsFile.matchAll(/{\s*name:\s*"([^"]+)"[\s\S]*?code:\s*`([\s\S]*?)`\s*}/g);
const presets = [];
for (const match of presetMatches) {
  presets.push({ name: match[1], code: match[2] });
}

console.log(`Found ${presets.length} presets to validate\n`);

let passed = 0;
let failed = 0;

const tmpInput = join(tmpdir(), 'jxl-art-validate-input.txt');
const tmpOutput = join(tmpdir(), 'jxl-art-validate-output.jxl');

for (const preset of presets) {
  process.stdout.write(`Testing "${preset.name}"... `);
  
  try {
    // Write preset code to temp file
    writeFileSync(tmpInput, preset.code);
    
    // Run jxl_from_tree
    const result = execSync(`jxl_from_tree "${tmpInput}" "${tmpOutput}" 2>&1`, {
      encoding: 'utf-8',
      timeout: 10000
    });
    
    // Check output file exists and has content
    const stats = readFileSync(tmpOutput);
    if (stats.length > 0) {
      console.log(`✅ OK (${stats.length} bytes)`);
      passed++;
    } else {
      console.log('❌ FAILED (empty output)');
      failed++;
    }
  } catch (e) {
    console.log('❌ FAILED');
    const output = e.stdout || e.stderr || e.message;
    if (output) {
      // Show relevant error lines
      const lines = output.split('\n').filter(l => l.trim()).slice(0, 5);
      console.log(`   ${lines.join('\n   ')}`);
    }
    failed++;
  }
}

// Cleanup
try { unlinkSync(tmpInput); } catch {}
try { unlinkSync(tmpOutput); } catch {}

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

process.exit(failed > 0 ? 1 : 0);

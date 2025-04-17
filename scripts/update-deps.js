#!/usr/bin/env node

/**
 * This script updates dependencies in package.json to newer versions
 * to address npm warnings
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Dependencies to update
const updates = {
  eslint: '^9.0.0',
  rimraf: '^5.0.0',
  glob: '^10.0.0',
};

// Update devDependencies
if (packageJson.devDependencies) {
  Object.entries(updates).forEach(([pkg, version]) => {
    if (packageJson.devDependencies[pkg]) {
      console.log(`Updating ${pkg} to ${version}`);
      packageJson.devDependencies[pkg] = version;
    }
  });
}

// Save updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('package.json updated. Run npm install to apply changes.');

// Create directory for the script if it doesn't exist
try {
  console.log('Script completed successfully.');
} catch (error) {
  console.error('Error executing script:', error);
} 
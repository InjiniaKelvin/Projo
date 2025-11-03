#!/usr/bin/env node
/**
 * Navigation Flow Testing Script
 * Tests all navigation paths referenced in the app
 */

const fs = require('fs');
const path = require('path');

console.log('NAVIGATION FLOW ANALYSIS');
console.log('========================\n');

// Define expected routes based on app structure
const expectedRoutes = {
  root: [
    'index.tsx',
    '_layout.tsx'
  ],
  auth: [
    'index.tsx',
    'login.tsx',
    'register.tsx',
    'test-login.tsx',
    '_layout.tsx'
  ],
  booking: [
    'details.tsx',
    'payment.tsx',
    'redesigned-form.tsx',
    'regular-services.tsx',
    'service-selection.tsx',
    'status.tsx',
    'tracking.tsx',
    'enhanced-tracking.tsx',
    '_layout.tsx'
  ],
  dashboard: [
    'admin.tsx',
    'client.tsx',
    'technician.tsx',
    '_layout.tsx'
  ],
  admin: [
    'analytics.tsx',
    'inventory.tsx',
    'payments.tsx',
    'settings.tsx',
    'technicians.tsx',
    'users.tsx'
  ]
};

// Check if files exist
function checkRoutes(section, files) {
  console.log(`Checking ${section}:`);
  console.log('-'.repeat(40));
  
  let allExist = true;
  files.forEach(file => {
    const filePath = path.join('app', section === 'root' ? '' : section, file);
    const exists = fs.existsSync(filePath);
    const status = exists ? '[OK]' : '[MISSING]';
    console.log(`  ${status} ${filePath}`);
    if (!exists) allExist = false;
  });
  
  console.log('');
  return allExist;
}

// Check all routes
let allRoutesExist = true;
for (const [section, files] of Object.entries(expectedRoutes)) {
  const exists = checkRoutes(section, files);
  if (!exists) allRoutesExist = false;
}

// Extract navigation paths from code
console.log('NAVIGATION PATHS USED IN CODE:');
console.log('=' .repeat(40));

const navigationPaths = new Set();

function extractNavigationPaths(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.')) {
      extractNavigationPaths(filePath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract router.push/replace paths
      const pushMatches = content.matchAll(/router\.(push|replace)\(['"]([^'"]+)['"]\)/g);
      for (const match of pushMatches) {
        navigationPaths.add(match[2]);
      }
      
      // Extract router.push with object notation
      const objectMatches = content.matchAll(/router\.(push|replace)\(\{[^}]*pathname:\s*['"]([^'"]+)['"]/g);
      for (const match of objectMatches) {
        navigationPaths.add(match[2]);
      }
    }
  }
}

extractNavigationPaths('app');

const sortedPaths = Array.from(navigationPaths).sort();
sortedPaths.forEach(pathStr => {
  // Determine if route file exists
  let routePath = pathStr;
  if (routePath.startsWith('/')) routePath = routePath.substring(1);
  
  // Remove query params
  routePath = routePath.split('?')[0];
  
  // Check if it's a valid route
  let routeFile = path.join('app', routePath);
  let exists = false;
  
  // Try with .tsx extension
  if (fs.existsSync(routeFile + '.tsx')) {
    exists = true;
  }
  // Try as directory with index.tsx
  else if (fs.existsSync(path.join(routeFile, 'index.tsx'))) {
    exists = true;
  }
  // Try without last segment (might be dynamic route)
  else if (routePath.includes('/')) {
    const parts = routePath.split('/');
    parts.pop();
    const parentPath = parts.join('/');
    if (fs.existsSync(path.join('app', parentPath + '.tsx')) ||
        fs.existsSync(path.join('app', parentPath, 'index.tsx'))) {
      exists = true;
    }
  }
  
  const status = exists ? '[OK]' : '[WARN]';
  console.log(`  ${status} ${pathStr}`);
});

console.log('\n' + '='.repeat(40));
console.log('SUMMARY:');
console.log(`  Total navigation paths found: ${sortedPaths.length}`);
console.log(`  All route files exist: ${allRoutesExist ? 'YES' : 'NO'}`);

console.log('\nRECOMMENDATIONS:');
console.log('-'.repeat(40));
console.log('1. Missing routes marked [WARN] should be created or refs removed');
console.log('2. Test each navigation path manually');
console.log('3. Ensure back() calls don\'t cause navigation loops');
console.log('4. Consider adding error boundaries for bad routes');

// Check for potential issues
console.log('\nPOTENTIAL ISSUES:');
console.log('-'.repeat(40));

const potentialIssues = [
  { path: '/tracking', note: 'Referenced but no tracking.tsx in root' },
  { path: '/support', note: 'Referenced but no support.tsx found' },
  { path: '/bookings', note: 'Plural - verify vs /booking' }
];

potentialIssues.forEach(issue => {
  const exists = sortedPaths.includes(issue.path);
  if (exists) {
    console.log(`  [CHECK] ${issue.path} - ${issue.note}`);
  }
});

console.log('\nDone!\n');

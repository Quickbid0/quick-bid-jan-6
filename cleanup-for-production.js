// PRODUCTION CLEANUP SCRIPT - Remove console statements for market release

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting production cleanup for QuickMela...');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }

  traverse(dir);
  return files;
}

// Function to clean console statements from a file
function cleanConsoleStatements(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let cleanedContent = content;

    // Remove console.log, console.error, console.warn, console.info statements
    // But keep console.error in error boundaries and critical error handling
    const consolePatterns = [
      /\s*console\.log\([^)]*\);\s*$/gm,
      /\s*console\.warn\([^)]*\);\s*$/gm,
      /\s*console\.info\([^)]*\);\s*$/gm,
      /\s*console\.debug\([^)]*\);\s*$/gm,
      /\s*console\.trace\([^)]*\);\s*$/gm,
    ];

    let hasChanges = false;
    consolePatterns.forEach(pattern => {
      if (pattern.test(cleanedContent)) {
        cleanedContent = cleanedContent.replace(pattern, '');
        hasChanges = true;
      }
    });

    // Remove empty lines that were left behind
    cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (hasChanges) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

// Main cleanup process
async function cleanupForProduction() {
  console.log('🔍 Finding all TypeScript and JavaScript files...');

  const srcDir = path.join(__dirname, 'src');
  const backendSrcDir = path.join(__dirname, 'backend', 'src');

  const files = [
    ...findFiles(srcDir, ['.ts', '.tsx', '.js', '.jsx']),
    ...findFiles(backendSrcDir, ['.ts', '.js']),
  ];

  console.log(`📁 Found ${files.length} files to check`);

  let cleanedCount = 0;
  let totalStatementsRemoved = 0;

  for (const file of files) {
    const relativePath = path.relative(__dirname, file);
    const beforeContent = fs.readFileSync(file, 'utf8');

    // Count console statements before cleaning
    const consoleMatches = beforeContent.match(/console\.(log|error|warn|info|debug|trace)\(/g) || [];
    const statementCount = consoleMatches.length;

    // Skip error boundaries and critical error files
    if (relativePath.includes('ErrorBoundary') ||
        relativePath.includes('error') ||
        relativePath.includes('security') ||
        relativePath.includes('auth')) {
      console.log(`⏭️  Skipping ${relativePath} (critical error handling)`);
      continue;
    }

    if (cleanConsoleStatements(file)) {
      cleanedCount++;
      totalStatementsRemoved += statementCount;
      console.log(`✅ Cleaned ${relativePath} (${statementCount} statements)`);
    }
  }

  console.log('\n🎉 PRODUCTION CLEANUP COMPLETE!');
  console.log(`📊 Summary:`);
  console.log(`   - Files cleaned: ${cleanedCount}`);
  console.log(`   - Console statements removed: ${totalStatementsRemoved}`);
  console.log(`   - Total files checked: ${files.length}`);

  if (cleanedCount > 0) {
    console.log('\n⚠️  IMPORTANT: Please test the application thoroughly after cleanup!');
    console.log('   Some console statements may have been critical for debugging.');
  }

  console.log('\n🚀 Ready for production deployment!');
}

// Run the cleanup
cleanupForProduction().catch(console.error);

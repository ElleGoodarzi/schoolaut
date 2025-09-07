// Precise Button Fix Count Verification Script
const fs = require('fs');
const path = require('path');

const SEARCH_DIRECTORIES = ['app', 'components'];

// Patterns for button fixes
const BUTTON_FIX_PATTERNS = [
  /onClick.*=.*\(\).*=>.*info\(/g,           // Toast info buttons
  /onClick.*=.*\(\).*=>.*warning\(/g,       // Toast warning buttons
  /onClick.*=.*\(\).*=>.*success\(/g,       // Toast success buttons
  /onClick.*=.*handleComingSoon/g,          // Coming soon handlers
  /onClick.*=.*\(\).*=>.*{.*preventDefault/g // Form submission fixes
];

const BUTTON_IDENTIFICATION_PATTERNS = [
  /<button[^>]*>/g,                         // HTML button tags
  /className.*btn/g,                        // DaisyUI button classes
  /role="button"/g                          // ARIA button roles
];

function findFilesRecursively(dir, extension = '.tsx') {
  let files = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files = files.concat(findFilesRecursively(fullPath, extension));
      } else if (entry.isFile() && entry.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Cannot read directory ${dir}:`, error.message);
  }
  
  return files;
}

function analyzeButtonFixes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixes = [];
    
    // Count different types of button fixes
    BUTTON_FIX_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern) || [];
      if (matches.length > 0) {
        const fixType = [
          'Toast Info Fixes',
          'Toast Warning Fixes', 
          'Toast Success Fixes',
          'Coming Soon Handlers',
          'Form Submission Fixes'
        ][index];
        
        fixes.push({
          type: fixType,
          count: matches.length,
          examples: matches.slice(0, 2) // First 2 examples
        });
      }
    });
    
    return fixes;
  } catch (error) {
    return [];
  }
}

function countTotalButtons(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let totalButtons = 0;
    
    // Count button elements
    const buttonMatches = content.match(/<button[^>]*>/g) || [];
    totalButtons += buttonMatches.length;
    
    // Count button-like elements
    const buttonClassMatches = content.match(/className.*"[^"]*btn[^"]*"/g) || [];
    totalButtons += buttonClassMatches.length;
    
    return {
      totalButtons,
      buttonElements: buttonMatches.length,
      buttonClasses: buttonClassMatches.length
    };
  } catch (error) {
    return { totalButtons: 0, buttonElements: 0, buttonClasses: 0 };
  }
}

function generateButtonFixReport() {
  console.log('='.repeat(80));
  console.log('🔍 PRECISE BUTTON FIX COUNT VERIFICATION');
  console.log('='.repeat(80));
  
  const allFiles = [];
  SEARCH_DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
      allFiles.push(...findFilesRecursively(dir));
    }
  });
  
  console.log(`📁 Scanning ${allFiles.length} files in ${SEARCH_DIRECTORIES.join(', ')}`);
  console.log('');
  
  let totalFixedButtons = 0;
  let totalButtons = 0;
  const fileResults = [];
  const fixSummary = {
    'Toast Info Fixes': 0,
    'Toast Warning Fixes': 0,
    'Toast Success Fixes': 0,
    'Coming Soon Handlers': 0,
    'Form Submission Fixes': 0
  };
  
  allFiles.forEach(filePath => {
    const fixes = analyzeButtonFixes(filePath);
    const buttonCount = countTotalButtons(filePath);
    
    if (fixes.length > 0 || buttonCount.totalButtons > 0) {
      const fileFixCount = fixes.reduce((sum, fix) => sum + fix.count, 0);
      totalFixedButtons += fileFixCount;
      totalButtons += buttonCount.totalButtons;
      
      // Update summary
      fixes.forEach(fix => {
        fixSummary[fix.type] += fix.count;
      });
      
      fileResults.push({
        file: filePath.replace(process.cwd() + '/', ''),
        buttonCount: buttonCount.totalButtons,
        fixesApplied: fileFixCount,
        fixes: fixes
      });
      
      if (fileFixCount > 0) {
        console.log(`📄 ${filePath.replace(process.cwd() + '/', '')}`);
        console.log(`   Buttons: ${buttonCount.totalButtons}, Fixes: ${fileFixCount}`);
        fixes.forEach(fix => {
          console.log(`   - ${fix.type}: ${fix.count}`);
        });
        console.log('');
      }
    }
  });
  
  console.log('='.repeat(80));
  console.log('📊 BUTTON FIX SUMMARY:');
  console.log(`Total Files Scanned: ${allFiles.length}`);
  console.log(`Files with Buttons: ${fileResults.filter(f => f.buttonCount > 0).length}`);
  console.log(`Files with Fixes: ${fileResults.filter(f => f.fixesApplied > 0).length}`);
  console.log(`Total Buttons Found: ${totalButtons}`);
  console.log(`Total Button Fixes Applied: ${totalFixedButtons}`);
  console.log('');
  
  console.log('📋 FIX TYPE BREAKDOWN:');
  Object.entries(fixSummary).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`  ${type}: ${count}`);
    }
  });
  console.log('='.repeat(80));
  
  return {
    totalFiles: allFiles.length,
    filesWithButtons: fileResults.filter(f => f.buttonCount > 0).length,
    filesWithFixes: fileResults.filter(f => f.fixesApplied > 0).length,
    totalButtons,
    totalFixedButtons,
    fixBreakdown: fixSummary,
    fileResults
  };
}

// Run the analysis
if (require.main === module) {
  const results = generateButtonFixReport();
  
  console.log('\n📋 VERIFICATION RESULT:');
  if (results.totalFixedButtons === 22) {
    console.log('✅ CONFIRMED: Exactly 22 button fixes applied');
  } else {
    console.log(`⚠️  CORRECTION: ${results.totalFixedButtons} button fixes found (not 22)`);
  }
  
  console.log('\n📊 DETAILED RESULTS:');
  console.log(JSON.stringify(results, null, 2));
}

module.exports = { generateButtonFixReport };

#!/usr/bin/env node

// Precise Button Audit Script
const fs = require('fs');
const path = require('path');

function findAllButtons() {
  const buttons = [];
  
  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Look for button elements
        if (line.includes('<button') || line.includes('<Button')) {
          const lineNumber = index + 1;
          
          // Extract button text (look ahead for content)
          let buttonText = 'Unknown';
          for (let i = index; i < Math.min(index + 5, lines.length); i++) {
            const textMatch = lines[i].match(/>\s*([^<]+)\s*</);
            if (textMatch && textMatch[1].trim()) {
              buttonText = textMatch[1].trim();
              break;
            }
          }
          
          // Check for onClick handler
          const hasOnClick = line.includes('onClick') || 
                           lines.slice(index, Math.min(index + 3, lines.length))
                             .some(l => l.includes('onClick'));
          
          // Check if disabled
          const isDisabled = line.includes('disabled') ||
                           lines.slice(index, Math.min(index + 3, lines.length))
                             .some(l => l.includes('disabled'));
          
          // Check for href (Link component)
          const hasHref = line.includes('href') ||
                        lines.slice(index, Math.min(index + 3, lines.length))
                          .some(l => l.includes('href'));
          
          // Determine status
          let status = 'broken';
          if (hasOnClick || hasHref) {
            status = 'working';
          } else if (isDisabled) {
            status = 'disabled';
          } else if (buttonText.includes('در حال توسعه') || buttonText.includes('Coming Soon')) {
            status = 'placeholder';
          }
          
          buttons.push({
            file: filePath.replace(process.cwd() + '/', ''),
            line: lineNumber,
            text: buttonText,
            hasOnClick,
            hasHref,
            isDisabled,
            status,
            code: line.trim()
          });
        }
      });
    } catch (error) {
      console.warn(`Could not scan ${filePath}: ${error.message}`);
    }
  }
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
        scanFile(fullPath);
      }
    }
  }
  
  // Scan app and components directories
  scanDirectory(path.join(__dirname, '../app'));
  scanDirectory(path.join(__dirname, '../components'));
  
  return buttons;
}

function analyzeButtons(buttons) {
  const analysis = {
    total: buttons.length,
    working: 0,
    broken: 0,
    disabled: 0,
    placeholder: 0,
    details: {},
    byFile: {}
  };
  
  buttons.forEach(button => {
    analysis[button.status]++;
    
    // Group by file
    if (!analysis.byFile[button.file]) {
      analysis.byFile[button.file] = {
        total: 0,
        working: 0,
        broken: 0,
        disabled: 0,
        placeholder: 0,
        buttons: []
      };
    }
    
    analysis.byFile[button.file].total++;
    analysis.byFile[button.file][button.status]++;
    analysis.byFile[button.file].buttons.push(button);
    
    analysis.details[`${button.file}:${button.line}`] = {
      text: button.text,
      status: button.status,
      hasHandler: button.hasOnClick || button.hasHref,
      isDisabled: button.isDisabled
    };
  });
  
  return analysis;
}

function generateReport(analysis) {
  console.log('='.repeat(100));
  console.log('🔍 COMPREHENSIVE BUTTON AUDIT REPORT');
  console.log('='.repeat(100));
  
  console.log(`Total buttons found: ${analysis.total}`);
  console.log(`✅ Working buttons: ${analysis.working}`);
  console.log(`❌ Broken buttons: ${analysis.broken}`);
  console.log(`⚪ Disabled buttons: ${analysis.disabled}`);
  console.log(`🚧 Placeholder buttons: ${analysis.placeholder}`);
  console.log(`Success rate: ${Math.round((analysis.working / analysis.total) * 100)}%`);
  console.log('');
  
  // Report by file
  console.log('📁 BUTTONS BY FILE:');
  console.log('-'.repeat(100));
  
  Object.entries(analysis.byFile).forEach(([file, data]) => {
    if (data.broken > 0 || data.placeholder > 0) {
      console.log(`${file}: ${data.total} buttons (${data.broken} broken, ${data.placeholder} placeholder)`);
      data.buttons.forEach(button => {
        if (button.status === 'broken' || button.status === 'placeholder') {
          console.log(`  Line ${button.line}: "${button.text}" - ${button.status.toUpperCase()}`);
        }
      });
      console.log('');
    }
  });
  
  // Detailed button status
  console.log('📋 DETAILED BUTTON STATUS:');
  console.log('-'.repeat(100));
  
  Object.entries(analysis.details).forEach(([location, button]) => {
    console.log(`[${button.text}]: ${button.status} | Handler: ${button.hasHandler} | Disabled: ${button.isDisabled}`);
  });
  
  console.log('='.repeat(100));
  
  return analysis;
}

// Main execution
const buttons = findAllButtons();
const analysis = analyzeButtons(buttons);
const report = generateReport(analysis);

// Save results
fs.writeFileSync(
  path.join(__dirname, '../BUTTON_AUDIT_RESULTS.json'),
  JSON.stringify(analysis, null, 2)
);

console.log('Results saved to BUTTON_AUDIT_RESULTS.json');

module.exports = { findAllButtons, analyzeButtons, generateReport };

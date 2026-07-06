const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/**/*.tsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // We want to replace trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
  // and thumbColor="#FFFFFF"
  // with trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }} 
  // and thumbColor={valueVariable ? '#3B82F6' : '#FFFFFF'}

  newContent = newContent.replace(/<Switch([^>]+)value=\{([^}]+)\}([^>]+)trackColor=\{\{\s*false:\s*'#E2E8F0',\s*true:\s*'#3B82F6'\s*\}\}([^>]+)thumbColor="#FFFFFF"/g, (match, p1, p2, p3, p4) => {
    return `<Switch${p1}value={${p2}}${p3}trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}${p4}thumbColor={${p2} ? '#3B82F6' : '#FFFFFF'}`;
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Updated', file);
  }
});

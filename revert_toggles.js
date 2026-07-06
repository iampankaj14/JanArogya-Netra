const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/**/*.tsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/trackColor=\{\{\s*false:\s*'#E2E8F0',\s*true:\s*'#DBEAFE'\s*\}\}\s*thumbColor=\{[^}]+\}/g, 
    'trackColor={{ false: \'#E2E8F0\', true: \'#3B82F6\' }}\n              thumbColor="#FFFFFF"'
  );

  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed to track blue', file);
  }
});

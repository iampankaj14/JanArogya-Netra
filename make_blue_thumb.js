const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/**/*.tsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace <Switch ... /> completely to ensure no leftover props
  const newContent = content.replace(/<Switch[\s\S]*?\/>/g, (match) => {
    // Extract value and onValueChange
    const valueMatch = match.match(/value=\{([^\}]+)\}/);
    const onChangeMatch = match.match(/onValueChange=\{([^\}]+)\}/);
    
    if (valueMatch && onChangeMatch) {
      const val = valueMatch[1];
      const onChange = onChangeMatch[1];
      
      return `<Switch 
              value={${val}}
              onValueChange={${onChange}}
              trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
              thumbColor={${val} ? '#3B82F6' : '#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
            />`;
    }
    return match;
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed', file);
  }
});

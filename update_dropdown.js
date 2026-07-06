const fs = require('fs');

let dropdownPath = 'components/ui/inputs/Dropdown.tsx';
let dropdownCode = fs.readFileSync(dropdownPath, 'utf8');

dropdownCode = dropdownCode.replace(/export interface DropdownProps \{/g, `export interface DropdownProps {\n  icon?: any;`);

// Add icon prop to interface if it's not exported
dropdownCode = dropdownCode.replace(/interface DropdownProps \{/g, `interface DropdownProps {\n  icon?: any;`);

dropdownCode = dropdownCode.replace(/error,\n\}: DropdownProps\) \{/g, `error,\n  icon,\n}: DropdownProps) {`);

dropdownCode = dropdownCode.replace(/const borderClass = error \? 'border-red-500 bg-red-50\/10' : 'border-slate-200 bg-white';/g, 
`const borderClass = error ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-slate-50';`);

dropdownCode = dropdownCode.replace(/<Text className=\{\`text-\[13px\] font-bold \$\{selectedOption \? 'text-brand-navy' : 'text-slate-400'\}\`\}>\n\s*\{selectedOption \? selectedOption.label : placeholder\}\n\s*<\/Text>/g,
`<View className="flex-row items-center flex-1">
          {icon && (
            <View className="w-8 h-8 rounded-xl bg-white shadow-sm shadow-black/5 items-center justify-center mr-3 border border-slate-100">
              <Feather name={icon} size={14} color="#3B82F6" />
            </View>
          )}
          <Text className={\`text-[13px] font-bold \${selectedOption ? 'text-brand-navy' : 'text-slate-400'}\`}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>`);

dropdownCode = dropdownCode.replace(/className=\{\`flex-row items-center justify-between border rounded-2xl h-14 px-4 shadow-sm shadow-slate-200\/50 \$\{borderClass\}\`\}/g,
`className={\`flex-row items-center justify-between border rounded-2xl h-14 px-4 shadow-sm shadow-black/5 \${borderClass}\`}`);

fs.writeFileSync(dropdownPath, dropdownCode);

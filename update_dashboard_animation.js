const fs = require('fs');
let file = 'components/features/dashboard/PHCHomeDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure Animated, FadeInRight is imported
if (!content.includes('react-native-reanimated')) {
  content = content.replace("import { Feather }", "import { Feather }\nimport Animated, { FadeInRight } from 'react-native-reanimated';");
}

// Update the map loop to use index and Animated.View
const mapRegex = /\.map\(\(item\) => \(\s*<View key=\{item\.id\}/g;
content = content.replace(mapRegex, ".map((item, index) => (\n            <Animated.View entering={FadeInRight.delay(index * 150).springify()} key={item.id}");

// Update the closing tags for those Animated.Views
// Finding the specific closing view for the mapped items in Today's summary
// Since we have multiple maps (top metrics and summary), we should replace both!
content = content.replace(/<\/View>\s*\)\)\}\s*<\/ScrollView>/g, "</Animated.View>\n          )))}\n        </ScrollView>");

fs.writeFileSync(file, content);
console.log('Added staggered animation');

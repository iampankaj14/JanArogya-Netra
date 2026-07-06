const fs = require('fs');
let file = 'app/(tabs)/profile.tsx';
let content = fs.readFileSync(file, 'utf8');

// Change text-[7px] to text-[12px] and text-[11px] to text-[16px] for better proportionality
content = content.replace(/text-\[7px\]/g, 'text-[12px]');
content = content.replace(/text-\[11px\]/g, 'text-[16px]');

// Fix the notification count from filter(n => !n.read) to just length
content = content.replace(/localNotifications\.filter\(n => !n\.read\)\.length/g, 'localNotifications.length');

fs.writeFileSync(file, content);

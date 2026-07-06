const fs = require('fs');
const readline = require('readline');

async function find() {
  const fileStream = fs.createReadStream('/Users/pankaj/.gemini/antigravity-ide/brain/0f1d17f8-26d9-4fac-8cfc-a4661d1ebb7f/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  // Start from last committed state (git show 9662d4f:situation-room.tsx)
  // Then apply all edits from steps 9898 to 10474 in order
  // This gives us the midnight "final" version
  
  let edits = [];
  
  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.step_index < 9890) continue;
      if (parsed.step_index > 10480) break;
      
      if (parsed.tool_calls) {
        for (const call of parsed.tool_calls) {
          if (call.args && call.args.TargetFile && call.args.TargetFile.includes('situation-room')) {
            edits.push({ step: parsed.step_index, ts: parsed.created_at, call });
          }
        }
      }
    } catch(e) {}
  }
  
  console.log(`Found ${edits.length} midnight edits`);
  edits.forEach(e => console.log(`  Step ${e.step} @ ${e.ts} - ${e.call.name}`));
}
find();

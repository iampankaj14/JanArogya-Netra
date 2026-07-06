const fs = require('fs');
const readline = require('readline');

async function findHomescreen() {
  const fileStream = fs.createReadStream('/Users/pankaj/.gemini/antigravity-ide/brain/0f1d17f8-26d9-4fac-8cfc-a4661d1ebb7f/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let allEdits = [];
  
  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      const ts = parsed.created_at;
      
      // Only look at July 5-6 2026
      if (!ts || ts < '2026-07-05T00:00:00Z') continue;
      if (ts >= '2026-07-06T10:00:00Z') break;
      
      if (parsed.tool_calls) {
        for (const call of parsed.tool_calls) {
          if (call.args && call.args.TargetFile && call.args.TargetFile.includes('situation-room.tsx')) {
            allEdits.push({
              step: parsed.step_index,
              ts: ts,
              tool: call.name,
              hasFullCode: call.name === 'write_to_file',
            });
          }
        }
      }
    } catch (e) {}
  }
  
  console.log("All situation-room edits on July 5-6:");
  allEdits.forEach(e => console.log(`  Step ${e.step} @ ${e.ts} - ${e.tool} - fullCode:${e.hasFullCode}`));
}

findHomescreen();

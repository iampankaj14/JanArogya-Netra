const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('/Users/pankaj/.gemini/antigravity-ide/brain/0f1d17f8-26d9-4fac-8cfc-a4661d1ebb7f/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let fullCode = null;
  let lastTimestamp = null;
  
  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      const ts = parsed.created_at;
      
      // Stop looking after July 3rd starts
      if (ts && ts.startsWith('2026-07-03')) break;
      
      if (parsed.tool_calls) {
        for (const call of parsed.tool_calls) {
          if (call.name === 'write_to_file' && call.args && call.args.TargetFile && call.args.TargetFile.includes('situation-room.tsx')) {
             fullCode = call.args.CodeContent;
             lastTimestamp = ts;
          }
        }
      }
    } catch (e) {}
  }
  
  if (fullCode) {
    console.log("Found write_to_file at:", lastTimestamp);
    fs.writeFileSync('situation_room_july2.tsx', fullCode);
    console.log("Saved to situation_room_july2.tsx");
  } else {
    console.log("No write_to_file found on July 2.");
  }
}

processLineByLine();

const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('/Users/pankaj/.gemini/antigravity-ide/brain/0f1d17f8-26d9-4fac-8cfc-a4661d1ebb7f/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lastCode = null;
  let lastTimestamp = null;
  
  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.tool_calls) {
        for (const call of parsed.tool_calls) {
          if ((call.name === 'replace_file_content' || call.name === 'write_to_file' || call.name === 'multi_replace_file_content') && 
              call.args && call.args.TargetFile && call.args.TargetFile.includes('situation-room.tsx')) {
            if (call.name === 'write_to_file') {
                lastCode = call.args.CodeContent;
                lastTimestamp = parsed.created_at;
            } else if (call.name === 'replace_file_content' && call.args.ReplacementContent) {
                lastCode = call.args.ReplacementContent;
                lastTimestamp = parsed.created_at;
            }
          }
        }
      }
    } catch (e) {}
  }
  
  if (lastCode) {
    console.log("Found edit at:", lastTimestamp);
    fs.writeFileSync('situation_room_recovered.tsx', lastCode);
    console.log("Saved to situation_room_recovered.tsx");
  } else {
    console.log("No edits found.");
  }
}

processLineByLine();

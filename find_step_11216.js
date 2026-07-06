const fs = require('fs');
const readline = require('readline');

async function find() {
  const fileStream = fs.createReadStream('/Users/pankaj/.gemini/antigravity-ide/brain/0f1d17f8-26d9-4fac-8cfc-a4661d1ebb7f/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.step_index >= 11210 && parsed.step_index <= 11225) {
        if (parsed.tool_calls) {
          for (const call of parsed.tool_calls) {
            if (call.args && call.args.TargetFile && call.args.TargetFile.includes('situation-room')) {
              console.log(`Step ${parsed.step_index} @ ${parsed.created_at}`);
              console.log('Tool:', call.name);
              console.log('TargetContent:', JSON.stringify(call.args.TargetContent || call.args.ReplacementChunks?.[0]?.TargetContent));
              console.log('ReplacementContent:', JSON.stringify(call.args.ReplacementContent || call.args.ReplacementChunks?.[0]?.ReplacementContent));
              console.log('---');
            }
          }
        }
      }
    } catch(e) {}
  }
}
find();

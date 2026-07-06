const fs = require('fs');
const readline = require('readline');

async function applyMidnightEdits() {
  let code = fs.readFileSync('/tmp/situation_room_committed.tsx', 'utf8');
  console.log(`Base committed: ${code.split('\n').length} lines`);

  const fileStream = fs.createReadStream('/Users/pankaj/.gemini/antigravity-ide/brain/0f1d17f8-26d9-4fac-8cfc-a4661d1ebb7f/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let editCount = 0;
  let failed = 0;

  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.step_index < 9890 || parsed.step_index > 10480) continue;
      
      if (parsed.tool_calls) {
        for (const call of parsed.tool_calls) {
          if (!call.args || !call.args.TargetFile || !call.args.TargetFile.includes('situation-room')) continue;
          
          if (call.name === 'replace_file_content') {
            const target = call.args.TargetContent;
            const replacement = call.args.ReplacementContent;
            if (target !== undefined && code.includes(target)) {
              code = code.split(target).join(replacement);
              editCount++;
            } else if (target) {
              failed++;
              console.log(`MISS step ${parsed.step_index}`);
            }
          } else if (call.name === 'multi_replace_file_content' && call.args.ReplacementChunks) {
            for (const chunk of call.args.ReplacementChunks) {
              const target = chunk.TargetContent;
              const replacement = chunk.ReplacementContent;
              if (target !== undefined && code.includes(target)) {
                code = code.split(target).join(replacement);
                editCount++;
              } else if (target) {
                failed++;
                console.log(`MISS step ${parsed.step_index} chunk`);
              }
            }
          }
        }
      }
    } catch(e) {}
  }

  console.log(`Applied: ${editCount}, Failed: ${failed}`);
  console.log(`Final: ${code.split('\n').length} lines`);
  fs.writeFileSync('/Users/pankaj/Desktop/JanArogya Netra/situation_room_MIDNIGHT.tsx', code);
  console.log('Done!');
}
applyMidnightEdits();

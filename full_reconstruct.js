const fs = require('fs');
const readline = require('readline');

async function reconstruct() {
  const fileStream = fs.createReadStream('/Users/pankaj/.gemini/antigravity-ide/brain/0f1d17f8-26d9-4fac-8cfc-a4661d1ebb7f/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let code = '';
  let editCount = 0;
  let lastStepProcessed = 0;
  
  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      const ts = parsed.created_at;
      // Stop after step 10474 (last edit to situation-room.tsx before midnight)
      if (parsed.step_index > 10480) break;
      
      if (parsed.tool_calls) {
        for (const call of parsed.tool_calls) {
          if (!call.args || !call.args.TargetFile || !call.args.TargetFile.includes('situation-room.tsx')) continue;
          
          if (call.name === 'write_to_file') {
             code = call.args.CodeContent || '';
             editCount++;
             lastStepProcessed = parsed.step_index;
             console.log(`Step ${parsed.step_index}: write_to_file (${code.length} chars)`);
          } else if (call.name === 'replace_file_content') {
             const target = call.args.TargetContent;
             const replacement = call.args.ReplacementContent;
             if (target !== undefined && replacement !== undefined && code) {
               const before = code.length;
               code = code.split(target).join(replacement);
               editCount++;
               lastStepProcessed = parsed.step_index;
               console.log(`Step ${parsed.step_index}: replace_file_content (${before} -> ${code.length} chars)`);
             }
          } else if (call.name === 'multi_replace_file_content' && call.args.ReplacementChunks) {
             for (const chunk of call.args.ReplacementChunks) {
               const target = chunk.TargetContent;
               const replacement = chunk.ReplacementContent;
               if (target !== undefined && replacement !== undefined && code) {
                 code = code.split(target).join(replacement);
               }
             }
             editCount++;
             lastStepProcessed = parsed.step_index;
             console.log(`Step ${parsed.step_index}: multi_replace_file_content (${code.length} chars)`);
          }
        }
      }
    } catch (e) { /* skip */ }
  }
  
  console.log(`\nTotal edits applied: ${editCount}`);
  console.log(`Last step processed: ${lastStepProcessed}`);
  console.log(`Final code length: ${code.length} chars`);
  
  if (code) {
    fs.writeFileSync('situation_room_FINAL.tsx', code);
    console.log("Saved to situation_room_FINAL.tsx");
  }
}

reconstruct();

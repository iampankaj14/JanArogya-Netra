const fs = require('fs');
const readline = require('readline');

async function reconstruct() {
  const fileStream = fs.createReadStream('/Users/pankaj/.gemini/antigravity-ide/brain/0f1d17f8-26d9-4fac-8cfc-a4661d1ebb7f/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let code = '';
  
  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      const ts = parsed.created_at;
      
      // Stop after July 2
      if (ts && ts >= '2026-07-03T00:00:00Z') break;
      
      if (parsed.tool_calls) {
        for (const call of parsed.tool_calls) {
          if (call.name === 'write_to_file' && call.args && call.args.TargetFile && call.args.TargetFile.includes('situation-room.tsx')) {
             code = call.args.CodeContent;
          } else if (call.name === 'replace_file_content' && call.args && call.args.TargetFile && call.args.TargetFile.includes('situation-room.tsx')) {
             if (code) {
               // Apply replacement
               const target = call.args.TargetContent;
               const replacement = call.args.ReplacementContent;
               if (target && replacement) {
                 code = code.replace(target, replacement);
               }
             }
          } else if (call.name === 'multi_replace_file_content' && call.args && call.args.TargetFile && call.args.TargetFile.includes('situation-room.tsx')) {
             if (code && call.args.ReplacementChunks) {
               for (const chunk of call.args.ReplacementChunks) {
                 const target = chunk.TargetContent;
                 const replacement = chunk.ReplacementContent;
                 if (target && replacement) {
                   code = code.replace(target, replacement);
                 }
               }
             }
          }
        }
      }
    } catch (e) {}
  }
  
  fs.writeFileSync('situation_room_reconstructed.tsx', code);
  console.log("Saved reconstructed file.");
}

reconstruct();

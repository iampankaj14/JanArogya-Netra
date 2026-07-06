const fs = require('fs');
const readline = require('readline');

async function findMapFinalized() {
  const fileStream = fs.createReadStream('/Users/pankaj/.gemini/antigravity-ide/brain/0f1d17f8-26d9-4fac-8cfc-a4661d1ebb7f/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let results = [];
  
  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      const ts = parsed.created_at;
      
      if (!ts || ts < '2026-07-05T17:00:00Z') continue;
      if (ts >= '2026-07-06T01:00:00Z') break;
      
      // Look for USER_INPUT messages with map/final keywords
      if (parsed.type === 'USER_INPUT' && parsed.content) {
        const content = parsed.content.toLowerCase();
        if (content.includes('map') || content.includes('final') || content.includes('perfect') || content.includes('ho gya') || content.includes('ho gyi')) {
          results.push({ step: parsed.step_index, ts, content: parsed.content.slice(0, 200) });
        }
      }
    } catch (e) {}
  }
  
  results.forEach(r => console.log(`Step ${r.step} @ ${r.ts}:\n  ${r.content}\n`));
}

findMapFinalized();

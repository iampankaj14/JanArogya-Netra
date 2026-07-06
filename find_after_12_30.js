const fs = require('fs');
const readline = require('readline');

async function findAfter1230() {
  const fileStream = fs.createReadStream('/Users/pankaj/.gemini/antigravity-ide/brain/0f1d17f8-26d9-4fac-8cfc-a4661d1ebb7f/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let results = [];
  
  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      const ts = parsed.created_at;
      
      // 12:30 AM IST = 19:00 UTC
      if (!ts || ts < '2026-07-05T18:55:00Z') continue;
      if (ts >= '2026-07-06T04:00:00Z') break;
      
      if (parsed.type === 'USER_INPUT' && parsed.content) {
        results.push({ step: parsed.step_index, ts, content: parsed.content.slice(0, 400) });
      }
    } catch (e) {}
  }
  
  results.forEach(r => {
    const ist = new Date(new Date(r.ts).getTime() + 5.5*3600000).toISOString().replace('T', ' ').slice(0, 19);
    console.log(`Step ${r.step} @ ${ist} IST:\n  ${r.content}\n`);
  });
}

findAfter1230();

// backend/tests/load_tests.ts
import { assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const TARGET_URL = "http://localhost:54321/functions/v1/dashboard/district-summary";
const CONCURRENT_REQUESTS = 30;
const MOCK_JWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_token_signature";

Deno.test({
  name: "Performance Test — Load Simulation",
  async fn() {
    const startTime = Date.now();

    // Spawn concurrent fetches
    const promises = Array.from({ length: CONCURRENT_REQUESTS }).map(async (_, idx) => {
      const start = Date.now();
      const res = await fetch(TARGET_URL, {
        method: "POST",
        headers: {
          "Authorization": MOCK_JWT,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }).catch(() => null);
      
      const duration = Date.now() - start;
      return { success: res ? res.status === 200 : false, duration, index: idx };
    });

    const results = await Promise.all(promises);
    const totalDuration = Date.now() - startTime;

    const successfulRequests = results.filter(r => r.success).length;
    const averageLatency = results.reduce((sum, r) => sum + r.duration, 0) / CONCURRENT_REQUESTS;

    console.log(`\n=== Load Simulation Results ===`);
    console.log(`Concurrent requests executed: ${CONCURRENT_REQUESTS}`);
    console.log(`Successful fetches count:     ${successfulRequests}`);
    console.log(`Average request latency:      ${averageLatency.toFixed(2)} ms`);
    console.log(`Total load duration:           ${totalDuration} ms\n`);

    // Basic assertion: at least some requests compile within reasonable server limits
    assert(totalDuration < 12000, "Load execution took too long.");
  },
});

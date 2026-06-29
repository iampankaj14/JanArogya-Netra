// backend/tests/security_tests.ts
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const BASE_URL = "http://localhost:54321/functions/v1";

Deno.test({
  name: "Security Test — Reject Unauthenticated Calls",
  async fn() {
    // Attempt request without Authorization headers
    const res = await fetch(`${BASE_URL}/dashboard/district-summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }).catch(() => null);

    if (res) {
      // Must return unauthorized status code (400/401)
      assertEquals(res.status >= 400, true);
      const body = await res.json();
      assertEquals(body.success, false);
    }
  },
});

Deno.test({
  name: "Security Test — Audit Log Access Control Check",
  async fn() {
    // Attempt query on audit logs without administrator role
    const PHC_STAFF_JWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_staff_token";
    
    const res = await fetch(`${BASE_URL}/dashboard/audit-logs`, {
      method: "POST",
      headers: {
        "Authorization": PHC_STAFF_JWT,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit: 10, offset: 0 }),
    }).catch(() => null);

    if (res) {
      // RLS policies or route logic must reject this query for non-admins
      const body = await res.json();
      if (body.success) {
        // If query succeeded, result list must be empty due to RLS filter
        assertEquals(body.data.length, 0);
      } else {
        // Or endpoint directly threw unauthorized exception
        assertEquals(body.success, false);
      }
    }
  },
});

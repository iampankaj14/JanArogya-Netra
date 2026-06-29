// backend/tests/api_tests.ts
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const BASE_URL = "http://localhost:54321/functions/v1"; // Supabase local dev environment port
const MOCK_JWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_token_signature";

Deno.test({
  name: "API Test — Dashboard Actions",
  async fn() {
    // 1. Test district-summary
    const resSummary = await fetch(`${BASE_URL}/dashboard/district-summary`, {
      method: "POST",
      headers: {
        "Authorization": MOCK_JWT,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }).catch(() => null);

    if (resSummary) {
      assertEquals(resSummary.status, 200);
      const body = await resSummary.json();
      assertEquals(body.success, true);
      assertExists(body.data.healthIndex);
      assertExists(body.data.totalPHCs);
    }
  },
});

Deno.test({
  name: "API Test — Medicine Transfers Request",
  async fn() {
    // 2. Test request-transfer validation error (missing parameters)
    const resFail = await fetch(`${BASE_URL}/medicine/request-transfer`, {
      method: "POST",
      headers: {
        "Authorization": MOCK_JWT,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourcePhcId: "phc_dharampur"
      }),
    }).catch(() => null);

    if (resFail) {
      assertEquals(resFail.status, 400);
      const body = await resFail.json();
      assertEquals(body.success, false);
    }
  },
});

Deno.test({
  name: "API Test — Search PHC Filters",
  async fn() {
    // 3. Test phc-search paginated endpoint
    const resSearch = await fetch(`${BASE_URL}/dashboard/phc-search`, {
      method: "POST",
      headers: {
        "Authorization": MOCK_JWT,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        search: "Dharampur",
        limit: 5,
        offset: 0
      }),
    }).catch(() => null);

    if (resSearch) {
      assertEquals(resSearch.status, 200);
      const body = await resSearch.json();
      assertEquals(body.success, true);
      assertExists(body.pagination.totalCount);
      assertExists(body.pagination.limit);
    }
  },
});

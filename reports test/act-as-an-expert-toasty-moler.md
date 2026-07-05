# JanArogya Netra — Full QA/UX Audit Report

This is a **research/audit deliverable**, not an implementation plan. No code will be changed as part of this turn. Findings are grouped by your four requested areas, ordered by severity within each. File:line references are exact where available.

---

## 1. Compilation & Syntax Errors

Verified with `npx tsc --noEmit` (strict mode is on). **8 confirmed build-breaking errors**, all with straightforward fixes:

| # | File:Line | Error | Fix |
|---|---|---|---|
| 1 | `app/(tabs)/district-map.tsx:139` | `TS2769` — ref callback `ref={(ref) => (webviewRef = ref)}` implicitly returns a value; React ref callbacks must return `void` | Wrap in braces: `ref={(ref) => { webviewRef = ref; }}` |
| 2-4 | `app/(tabs)/inventory.tsx:34-36` | `TS2367` — filters compare `m.type` against `'CONSUMABLE'`/`'EQUIPMENT'`/`'VACCINE'`, none of which exist in the real `MedicineType` union (`constants/medicineTypes.ts`); real value is `'VACCINES'` (plural) | Reconcile filter category strings with the actual `MedicineType` enum |
| 5 | `inventory.tsx:197` | Same `TS2367` mismatch at render time (icon selection) | Same fix as above |
| — | `inventory.tsx:57` | Related data-integrity bug: `type: newItemType as any` in `handleAddItem` silently launders invalid type strings into `MedicineStock.type` — new items get a type that's never valid | Fix root cause (category vocabulary) rather than casting |
| 6-7 | `app/(tabs)/reports.tsx:73-74` | `TS2339` — filters on `m.status === 'critical'`; `MedicineStock` has no `status` field, only `currentStock`/`minRequiredStock` | Derive criticality from stock levels, e.g. `m.currentStock <= m.minRequiredStock` |
| 8 | `components/common/NetraAIAssistant.tsx:52-57` | `TS2345` — `as const` binds only to `'model'`, not the whole ternary, so `role` widens to `string` and fails `geminiService.askNetra`'s `'user'|'model'` param type | `role: (msg.sender === 'user' ? 'user' : 'model') as 'user' | 'model'` |

**Practical impact**: because `inventory.tsx`'s filter bugs (2-5) mean Consumables/Equipment/Vaccines tabs always return empty lists, and reports.tsx's `.status` bug means "critical medicines" always evaluates to `undefined` (falsy) — these aren't just type errors, they silently break real features even if a looser tsconfig let the build through.

### Runtime risk (compiles fine, misbehaves at runtime)
- **`situation-room.tsx:817,822`** — dynamic Tailwind class interpolation `` `bg-${audit.color}-500` `` / `` `border-${audit.color}-100/50` ``. NativeWind's static JIT scanner can't see runtime-interpolated strings and there's no `safelist` in `tailwind.config.js` — these color dots/backgrounds risk rendering unstyled in a production build even if they look fine in dev.
- **Dual, disconnected auth stores**: `context/AuthContext.tsx` (used by all screens) and `store/useAuthStore.ts` (Zustand, used only by `hooks/useAlerts.ts`, `hooks/useAuth.ts`, `hooks/useNotifications.ts`) never sync. Concretely: `hooks/useNotifications.ts` gates its query on `!!user?.id` from the Zustand store, which is **always null** — so that hook can never fetch anything. (Not currently user-visible because `app/notifications.tsx` bypasses this hook entirely — see §2/§3.)
- **`phcs.tsx:39`** — `searchQuery.split(/\\s+/)` uses a literal-backslash regex instead of `/\s+/`; multi-word search splitting silently no-ops.

### Minor / lint-level
- `key={index}` array-index-as-key in 5 files (`phc-detail.tsx:609`, `situation-room.tsx:537,746`, `SummaryCard.tsx:38`, `PieChart/BarChart/AreaChart.tsx`) — low risk today since none of these lists reorder.
- Disease image filenames (`chinungunya.png`, `typhois.png`, `pheumoina.png`) are typos, but code and asset names match exactly — cosmetic only, not a build risk.
- Dead root-level script `fix_tracker.js` (already-applied one-off patch, unused) and two unused PNGs in `data/phc/phc illustration/` — cleanup debt only.
- No missing imports, no unclosed JSX, no circular imports, no duplicate exports found anywhere in the audited scope.

---

## 2. Data Hardcoding vs. Dynamic Mapping

### Most severe (looks like a real bug in front of users)
- **`app/(tabs)/district-map.tsx:36`** — `const assignedBlock = 'Dadri'` is hardcoded, completely ignoring `authState.facilityId`. **Every BMO user, regardless of actual assignment, only ever sees Dadri block on the map.** Correct source: `authState.facilityId` (already used correctly the same way in `phcs.tsx`).
- **`app/disease-analytics.tsx`** (lines 34-107) — the entire stats block (Growth Index, Weekly Delta, Model Forecast, Current/Previous Week Cases, Historical Max Peak, "89% modeling confidence") is 100% hardcoded strings that only branch on a static `isHighRisk` array-membership check — despite `localDiseaseTrends` (in `dummy/diseaseTrends.ts`) already containing the real per-disease `cases`/`trend`/`isUp`/`data[]` fields this screen should be using.
- **`components/ui/charts/AreaChart.tsx`, `LineChart.tsx`, `BarChart.tsx`, `PieChart.tsx`** — all four "reusable" chart primitives have zero `data` prop; every value is hardcoded inside the component. `AreaChart` is actively used by `disease-analytics.tsx` (so its chart never reflects the selected disease); the other three are dead code today, but are a landmine if wired in later without modification.

### Dashboard-level fabrication
- **`components/features/dashboard/PHCHomeDashboard.tsx`**:
  - Line 22: reads frozen `dummyAlerts` instead of mutable `localAlerts` (state desync vs. mutations elsewhere in the same file).
  - Lines 38-43: hardcoded `facilityNames` map covers only 3 of 11 facilities; falls back to `'PHC Barola'` for the other 8 even though the correct `phc.name` is already available.
  - Lines 51-57: `pendingTests`, `newPatients`, `referrals`, `labTests`, `followUps`, `discharges` are all fabricated as arbitrary multiplier ratios of `todayFootfall`/`bedsOccupied` (e.g. `todayFootfall*0.25`) — presented as real counts with no backing field.
  - Line 74: weather widget (`"32°C"`, `"Partly Cloudy"`, `"62%"`) is fully static with no data source at all.
  - Lines 289-349: "Facility Status Footer" (Internet/EMR Sync/Last Sync/Data Security) is entirely static text, even though a real `lastSyncTime` is computed dynamically elsewhere in the app.
- **`app/(tabs)/phc-detail.tsx`**: reads frozen `dummyPHCs` instead of mutable `localPHCs` (line 2/45); `opdThisMonth` (line 81) is a fabricated formula (`footfall*4 + healthScore*10`); "OPD This Month" and "Avg. Wait Time" `MetricCard`s have hardcoded trend deltas (`+12%`, `-8 mins`) never computed from real history; "Lab Services" always shows literal `"Available"`.
- **`app/(tabs)/situation-room.tsx`**: telemetry/AI-rec sparklines (lines 83-95) are `Math.sin`/`Math.cos`-generated decoration anchored only at real endpoints (comment on line 84 confirms this is intentional); BMO-role filtering for telemetry audits and logistics requests relies on fragile substring matching against free-text fields (root cause: `dummy/logistics.ts` and `localTelemetryAudits` have no structured facility-id references).
- **`app/(tabs)/profile.tsx`**: location resolution (line 24) only handles 2 hardcoded facility IDs and falls back to a generic string for everyone else; "PHCs Managed"/"Beds Managed"/"Team Members" stat card (lines 102-113) is hardcoded per role (and the DHO figure of "24 PHCs" is simply wrong — only 11 facilities exist); "Member Since: Jan 2024" has no backing field; notification badge hardcodes `"3"`.
- **Three independent hardcoded "3"s** that happen to agree by coincidence, not shared computation: `app/(tabs)/_layout.tsx:178` (`unreadNotificationsCount={3}`), `profile.tsx:180` (badge), `notifications.tsx:29-32` (filter pill counts) — the moment any of these gets fixed alone, they'll start visibly disagreeing.
- **`app/notifications.tsx`**: reads frozen `dummyNotifications` via local `useState` (bypasses `localDb.ts`/repository/hook layer entirely) — anything added via `addLocalNotification` elsewhere in the app never appears here.

### Latent data-leakage bugs (not yet reached by any screen, but live the moment a hook is wired up)
- `services/repositories/notificationsRepository.ts` — `getNotifications(userId)` ignores `userId`, returns everything.
- `services/repositories/reportsRepository.ts` — `getReports()` unfiltered by role/facility. Its `hooks/useReports.ts` wrapper is unused anywhere in the app (dead code today).
- `services/repositories/transfersRepository.ts` — `getTransfers()` unfiltered, and this one **is** actively consumed unfiltered by `app/(tabs)/resource-movement-tracker.tsx:19` — every role currently sees every district-wide transfer.

### Mock-DB data-quality issues worth flagging (not UI bugs per se, but explain some symptoms above)
- `dummy/district.ts` `totalPHCs: 14` is stale (real count is 11); masked because `hooks/useDistrict.ts` recomputes it correctly — but a landmine for any future direct read.
- `dummy/medicines.ts` — all VACCINE/CONSUMABLE/EQUIPMENT items are hardcoded to `facilityId: 'phc_barola'` only; every other of the 11 facilities has zero records in these categories, so inventory category filters return empty for 10/11 PHCs regardless of the `tsc` bug above.
- `dummy/logistics.ts` — `from`/`to` fields are inconsistent free-text labels not reliably matching real PHC ids/names — root cause of the fragile substring-match filtering in `situation-room.tsx`.
- One orphaned reference: `localTransfers` entry `SHP-5678` targets `'phc_mandi'`, which doesn't exist (real id is `'phc_mandi_shyam_nagar'`).

---

## 3. Dead Buttons & Broken Flows

### Dead (no `onPress`, or empty handler)
17 confirmed instances, most notable:
- `district-map.tsx:231-233` — circular nav/compass FAB, completely inert.
- `situation-room.tsx:722-725` — "View Details" on AI Decision Request card (its sibling "Approve Request" button works).
- `situation-room.tsx:814-836` — "Recent Telemetry Audits" rows show a chevron affordance but aren't touchable at all.
- `notifications.tsx:134` — every `NotificationCard`, `onPress={() => {}}` explicitly.
- `profile.tsx:63-66` — "Edit Profile" pill.
- `inventory.tsx:240-245` — floating barcode-scanner FAB, fully inert.
- `inventory.tsx:83-87` — facility-selector chip (chevron shown, no picker behind it).
- `PHCHomeDashboard.tsx` — "View" on high-alert banner (~172-175) and "View All Tasks" (~278-281), both inert.
- Several more inert header icons (`settings.tsx`, `resource-redistribution.tsx`, `resource-movement-tracker.tsx`) and non-touchable rows presented with chevrons (`phc-detail.tsx` alerts list, low-stock banner).

### Misleading (does something, but not what it implies)
- **`settings.tsx:238-245`** — "Save Console Configuration" just calls `router.back()`; the 4 toggles above it are local `useState` only, never persisted anywhere.
- **`profile.tsx:204`** — "Help Desk & Guides" shows a raw `alert('...is loading...')` and never loads anything.
- **`GlobalHamburgerMenu.tsx` logout icon** — calls `router.replace('/login')` but **never calls `logout()`** from `useAuth()`, so the Firebase/SecureStore session is never actually cleared (contrast with `profile.tsx`'s correct `handleLogout`, which does call `await logout()`). This is a real security/correctness bug — a "logged out" user may still have a live restorable session.
- Raw native `alert()` used in several places even though the app already has unused `Snackbar`/`SuccessBanner`/`ConfirmationDialog` components sitting in `components/ui/feedback/` — inconsistent feedback UX.

### Broken/orphaned navigation
- **`app/disease-analytics.tsx`** is a fully built, working screen that **nothing in the app links to** — only reachable by manually typing the route. Dead weight or a missed integration point (and per §2, its content is also the most hardcoded screen in the app).
- **Session-restore is dead**: `AuthContext.tsx` correctly restores a Firebase/SecureStore session on relaunch, but `app/index.tsx`'s splash screen unconditionally `router.replace('/login')`s after a fixed 4s timer regardless of restored auth state — previously-logged-in users are always forced through login again.

### RBAC / role-leakage — the most important finding in this section
**Role gating is UI-only (hide the tab), not enforced at the route or data layer.** There is no guard in `app/_layout.tsx`; every screen is a registered route reachable via direct `router.push`/deep link regardless of what the tab bar shows.
- `district-map.tsx` only checks `isBMO` (and has the hardcoded-Dadri bug above) — PHC and DHO roles see the entire district map unrestricted.
- `scenario-simulator.tsx`, `resource-redistribution.tsx`, `resource-movement-tracker.tsx` have **no role check at all**. Most severe: `resource-redistribution.tsx`'s source/target dropdowns list every PHC in the district with no ownership restriction — a PHC-level user could draft a transfer between two facilities they have no association with (a business-logic-level authorization gap, not just a UI one).
- `GlobalHamburgerMenu.tsx` shows Scenario Simulator / Stock Transfer / Logistics Tracker / Console Settings to **all roles unconditionally**.
- Only `phcs.tsx` and `reports.tsx` correctly scope data by role today — proving the gap elsewhere is inconsistency, not a technical limitation.

### Dead-end screen
- `phc-detail.tsx` has no back button and relies only on the shared `TopAppBar` (hamburger/logo/notifications/profile, no back affordance) — a user arriving here from `phcs.tsx` or a "Needs Attention" row has no obvious way back except OS gesture/hardware back. Every other detail-style screen in the app has an explicit working back button.

---

## 4. UX & Missing-Feature Review (mentally using the app as DHO/BMO/PHC)

- **Fabricated confidence/trend numbers erode trust in the "AI-first" pitch.** Static confidence scores (0.94, 0.98…) on `AIRecommendation`s, a flat `"88%"` confidence badge on every scenario-simulator run regardless of actual output, and sine/cosine-decorated sparklines all *look* like real model output. For a platform whose value proposition is predictive/AI-driven decision support, numbers that never change per input will be noticed by a real DHO within a few uses and undermine credibility.
- **BMO's map bug (`Dadri` hardcode) is a trust-breaking first impression** — a BMO who isn't assigned to Dadri opens the district map, sees the wrong block, and reasonably concludes the whole app's data pipeline is unreliable.
- **Cross-role data leakage weakens the core "role-based" premise of the product.** A PHC medical officer being able to reach `scenario-simulator` or draft an inter-facility transfer via `resource-redistribution` isn't just a security nit — it's inconsistent with the product's stated audience segmentation (DHO/BMO/PHC), and could lead to a PHC user accidentally moving stock away from their own facility.
- **Logout that doesn't log out** is a serious UX/trust issue on a health-data platform — a user tapping "Logout" from the hamburger menu (likely the more discoverable path) has no way to know their session wasn't actually cleared.
- **`phc-detail.tsx`'s missing back button** is a small but real "abrupt" navigation moment — the most detail-dense screen in the app is also the one place a user can get stranded.
- **Notification badge counts that never match the notification list** (three independent hardcoded "3"s) is exactly the kind of small inconsistency that makes an app feel unfinished even if each number was fine in isolation.
- **Missing metrics worth considering** for the dashboards, given the platform's stated purpose (predictive health monitoring + logistics for a health department):
  - PHC dashboard has no visible "last inventory sync" per medicine batch/expiry warning — only aggregate stock health, despite `dummy/medicines.ts` presumably carrying expiry-relevant fields.
  - No trend/history view for a single PHC over time (only current-snapshot + fabricated `trend` deltas) — a real DHO would want to see a facility trending down over weeks, not just today's number.
  - Reports screen (the one screen with clean, fully-dynamic data — good reference implementation) has no export/share/print action, which is a common expectation for a "Reports" screen in a government-facing tool.
- **Inconsistent facility name resolution** (`resource-movement-tracker.tsx` does raw `.replace('phc_','').replace('chc_','')` string surgery instead of a real name lookup, and doesn't handle the `uphc_` prefix at all) will show visibly broken labels like `uphc_surajpur` to end users on that screen.

---

## Suggested Fix Priority (if you want to proceed to implementation next)

1. **P0 — data/security correctness**: `district-map.tsx` hardcoded `'Dadri'` block; hamburger-menu logout not calling `logout()`; the 8 `tsc` build errors (all quick, mechanical fixes).
2. **P1 — role/RBAC enforcement**: add a real route guard (or per-screen role check) for `scenario-simulator`, `resource-redistribution`, `resource-movement-tracker`, `district-map`, matching the pattern already correct in `phcs.tsx`/`reports.tsx`.
3. **P2 — de-fabrication pass**: wire `disease-analytics.tsx` and the four chart primitives to `localDiseaseTrends`; replace `PHCHomeDashboard.tsx`'s fabricated ratios/weather/footer with real fields or remove them; fix the frozen-`dummy*`-vs-mutable-`local*` read inconsistency across `phc-detail.tsx`, `inventory.tsx`, `phcs.tsx`, `notifications.tsx`.
4. **P3 — dead buttons & flows**: wire the 17 inert buttons to real actions or remove them; add a back button to `phc-detail.tsx`; either link to or remove the orphaned `disease-analytics.tsx` route; fix session-restore in `app/index.tsx`.
5. **P4 — polish**: replace raw `alert()` calls with the existing unused `Snackbar`/`ConfirmationDialog` components; reconcile the three independent "3" badges to a single computed source; fix minor typos (`phcs.tsx` regex, disease image filenames) and remove dead code (`fix_tracker.js`, unused chart components if not adopted).

This report contains no code changes. Let me know which priority tier you'd like to tackle first and I'll switch out of audit mode into implementation.

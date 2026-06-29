# Development & Local Testing Workflow

This guide details how developers and AI coding assistants build, run, and test features locally.

## 🛠️ Getting Started

### Local Setup
1. Clone the repository.
2. Setup local environment configurations:
   ```bash
   cp .env.example .env
   ```
3. Install npm packages:
   ```bash
   npm install
   ```

### Run Local Bundler
```bash
# Starts local Metro bundler
npm start
```
Use shortcodes:
- `i` to open iOS simulator
- `a` to open Android emulator
- `w` to open web browser view

---

## 🧪 Mocking & Service Integration

### Phase 1: Dummy Provider Testing
To ensure the Frontend Lead can build screens without Firebase integration, the app imports mock datasets directly from `/dummy/*`.

- Customs hooks (e.g., `hooks/useAlerts.ts`) should return values directly from `dummy/alerts.ts` initially.

### Phase 2: Repository Swap
When Developer 2 (Backend Lead) completes the Firebase Firestore integrations:
1. They will write database getters inside `services/repositories/`.
2. Custom hooks (e.g., `hooks/useAlerts.ts`) will be updated to switch from calling dummy data to calling the completed Repository services.
3. **Important**: Because screens only read from hooks, **no frontend UI or screen files should need editing** during this data switch.

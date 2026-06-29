# Team Collaboration & AI Coding Rules

This guide outlines rules for Developers and AI assistants working on **JanArogya Netra**.

---

## 🔒 Folder Ownership & Boundaries

```
components/ ui/ theme/ assets/    <-- Owned by Frontend (UI/UX)
services/ firebase/ store/ hooks/ <-- Owned by Backend (Auth/DB/AI)
shared/                           <-- Read-only Shared Contracts
```

- **Frontend Lead**: Modifies visual layouts. Must **NEVER** import or use SDKs like Firebase, Firestore, or Gemini Generative models.
- **Backend Lead**: Modifies data layers. Must **NEVER** write or edit visual style attributes, Tailwind classes, navigation router folders, or presentation screens.
- **AI Assistants**: Are strictly bound to the developer roles. Do not cross borders.

---

## 🪵 Git Workflow & Branch Strategy

No developer or AI may commit directly to `main`. All development must be done in feature or bugfix branches, integrated first into `frontend` or `backend`, and finally merged into `main`.

### Branch Ownership
- **`main`**: Protected integration branch.
- **`frontend`**: Main branch for Frontend Lead. Only Frontend folders (`app/`, `components/`, `theme/`, `assets/`, `navigation/`) can be modified.
- **`backend`**: Main branch for Backend Lead. Only Backend folders (`services/`, `firebase/`, `hooks/`, `repositories/`, `store/`, `functions/`) can be modified.

### Branch Naming Conventions
- `frontend` and `backend`: Continuous integration branches.
- `feature/name-of-feature`: For new features (e.g. `feature/situation-room-ui`).
- `bugfix/issue-description`: For bug fixes.

### Commit Syntax Rules
Follow Semantic Commits:
- `feat: ...` for new features.
- `fix: ...` for bug fixes.
- `chore: ...` for tool updates, configurations, or asset additions.
- `docs: ...` for documentation files.

### Merging & Reviews
1. Open a Pull Request from `feature/*` targeting either `frontend` or `backend`.
2. **Pull before Push**: Always pull the latest remote changes (`git pull origin <branch-name>`) before pushing to avoid out-of-sync branches.
3. **Resolve Conflicts Locally**: Conflicts must be resolved locally before merging. Never attempt automated or force merges on GitHub/GitLab.
4. Ensure `tsc --noEmit` and `npm run lint` pass successfully.
5. Review conflicts using the **Conflict Resolution Strategy** (see below).
6. Merge into `main` only after integrations have been fully tested and validated.

---

## 🛡️ Coding Responsibilities & Rule Sets

### 1. Data Contracts (Stated Types)
- All data models used across layers (e.g. `PHC`, `User`, `AlertItem`) **must** live in `shared/types/`.
- No inline data interface duplicate declarations are allowed.

### 2. Styling Rules (NativeWind & Tailwind)
- Use **Tailwind class properties** exclusively inside components.
- Rely on global theme colors (`constants/colors.ts`) to maintain branding consistency.

### 3. State Management (Zustand & React Query)
- Expose state models inside `store/` or retrieve them through custom hooks (`hooks/`).
- Components should only trigger handlers and read simple primitive states.

---

## ⚡ Conflict Resolution Strategy

In the event of a code conflict (e.g. while staging files or changing model contracts):
1. **Never override shared types unilaterally**: Always communicate with the other lead.
2. **Strict separation of files**: Since frontend developers and backend developers edit different files, merge conflicts in features should be virtually nonexistent.
3. If a conflict occurs in `shared/`, the team must align on the interface contract change, update `PROJECT_CONTRACT.md`, and then resolve the code difference.

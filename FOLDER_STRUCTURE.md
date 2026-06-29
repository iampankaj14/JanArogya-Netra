# Folder Structure & Ownership Strategy

This document maps directories and assigns clear boundaries to prevent development collisions.

```
├── app/                  # [FRONTEND] Screen views, layouts & tab structures
├── assets/               # [FRONTEND] Shared media assets (icons, splash, images)
├── components/           # [FRONTEND] Reusable visual interface layers
│   ├── common/           # Custom composite components (Headers, Nav bars)
│   └── ui/               # Lower-level primitives (Buttons, Inputs, Badges, Feedback overlays)
├── theme/                # [FRONTEND] Styling presets (colors, typography spacing maps)
├── dummy/                # [SHARED] Mock databases to test offline views
├── shared/               # [SHARED] STRICT - Contract Layer
│   ├── types/            # Data models and interfaces
│   ├── constants/        # Central configurations (roles, routes, system properties)
│   └── utils/            # General helpers
├── hooks/                # [BACKEND] React hooks wrapping Services (UI data bridges)
├── services/             # [BACKEND] Service Layer
│   ├── repositories/     # Firestore direct reading and writing
│   ├── api/              # Network config (Axios instances)
│   └── ai/               # Gemini interaction wrappers
├── firebase/             # [BACKEND] Configuration parameters
├── store/                # [BACKEND] Zustand state management
└── config/               # [BACKEND] Dev build configurations
```

---

## 🔒 Folder Ownership Boundary Rules

- **Frontend Lead**: Owns `app/`, `components/`, `theme/`, and `assets/`.
- **Backend Lead**: Owns `services/`, `firebase/`, `store/`, and `hooks/`.
- **Contract Agreement**: No developer or AI assistant should modify files under `shared/` without team alignment and updating `PROJECT_CONTRACT.md`.

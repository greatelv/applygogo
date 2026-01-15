# Context Checkpoint: 2026-01-15 - Global Expansion & Resume Narrative Feature

## 📌 Status Check

- **Current Task:** Global Service Expansion (Multi-region Database + Korean Narrative Generation for Global Users)
- **Last Action:** Attempted to test "Korean Narrative Generation" script, but failed due to Database Connection Error on the Global (SG) instance.

## 🛠️ Accomplished

1.  **Feature Implementation:**
    - API: Back-end logic for generating Korean narrative resumes using Gemini 2.0 (`/api/resumes/[id]/generate-ko`).
    - UI: "Generate Korean Narrative" button and result view added to `ResumeDetailPage` (visible only to Global users).
2.  **Database & Schema:**
    - Schema Updated: Added `data`, `convertedData` (Json), `sourceLang`, `targetLang` to `Resume` model.
    - **KR Database (Seoul):** Schema changes successfully applied (`db push` done). **Stable.**
    - **Global Database (Singapore):** Application Pending.

## 🚧 Current Blocker

- **Singapore DB Connection Error:**
  - Command `pnpm prisma db push` (and test scripts) fails for the Singapore instance.
  - Error: `Tenant or user not found` / `Can't reach database server`.
  - **Diagnosis:** Likely the Supabase project is **Paused** (free tier limit) or the connection string in `.env.global` has an incorrect Host/Password.

## 📝 Next Steps (To-Do)

1.  **Wake up Supabase:** Go to Supabase Dashboard > Check if Singapore Project is "Paused" -> Click "Restore".
2.  **Verify Credentials:** Copy the _Transaction Pooler_ connection string again from Dashboard > Settings > Database.
3.  **Sync Global DB:** Run `pnpm prisma db push` with the correct Global DB URL to apply the new schema.
4.  **Test Feature:** Verify the "Korean Resume Generation" button works on the website (`/en/resumes/...`).

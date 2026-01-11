You are working in a Next.js + React demo project that showcases axios interceptors.

Goal
- Add clear demo controls to trigger 404/500 responses for each API client (HQ ERP, Client App, Vendor ERP).
- Keep code simple and well-commented for a presentation.

Libraries in use
- React Hook Form, Zod, Zustand, Tailwind, TanStack Query, axios

Required behaviors
- Axios interceptors handle 404/500 globally.
- Token refresh logic retries on 401.
- On errors, redirect to /error page.

Implementation notes
- Keep comments concise and meeting-friendly.
- Use local Next.js API routes under /api to simulate responses.
- Provide buttons to trigger 404/500 for each API card.

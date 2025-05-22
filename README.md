Description
This chatbot provides helpful text answers and YouTube video links on how to store various food items properly. Simply ask a question like “How to store apples?” and the bot responds with storage tips along with a curated YouTube tutorial link demonstrating the process. It supports a wide range of foods and aims to help users keep their groceries fresh for longer.

Technologies and Tools Used
TypeScript — For type-safe, modern JavaScript development throughout the app.

React (with functional components) — Building UI components such as chat message cards, YouTube link cards, and the main app.

Next.js — For server-side rendering and React-based framework features (inferred from next-env.d.ts and next.config.ts).

Tailwind CSS — Utility-first CSS framework for styling (tailwind.config.ts and postcss.config.mjs).

Custom Hooks — Such as use-mobile.tsx and use-toast.ts for handling mobile responsiveness and toast notifications.

Services Layer — youtube-service.ts for handling YouTube API or related video fetching logic.

Utilities — General helper functions in utils.ts.

Type Definitions — Centralized type definitions in types/index.ts for consistent typing.

Environment Variables — Managed using .env for sensitive keys or config.

Git — Version control with .gitignore and project management.


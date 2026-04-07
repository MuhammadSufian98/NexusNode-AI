# NexusNode AI Frontend

This package contains the Next.js App Router frontend for NexusNode AI.

## Stack

- Next.js 16.2.2
- React 19.2.3
- Tailwind CSS
- Zustand
- Framer Motion

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Notes

- Auth sessions use HttpOnly cookies.
- Profile data is fetched from `/api/profile` routes.
- Avatar uploads now sync to MongoDB Atlas through the backend profile module.
- The profile store hydrates from auth state first, reducing duplicate `/me` calls.
- Avatar rendering uses `next/image` with the backend-provided `avatarUrl` data URL.

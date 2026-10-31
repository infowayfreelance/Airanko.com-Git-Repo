# Airanko.com-Git-Repo

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_lPKljxQu3TRccXWWwtDffOn0M5Zv)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/Hamzafarooq787/Airanko.com-Git-Repo" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>

## Validation and website cloner safety

- `pnpm run typecheck` checks all TypeScript; production builds also enforce type checking.
- `pnpm run test:security` runs mocked URL/DNS/redirect/transport and cloner-route regression tests (Node.js 24+; no real outbound requests).
- `pnpm run build` validates the production build.

The cloner only fetches public HTTP(S) URLs on standard ports, pins validated DNS addresses, and limits redirects, body sizes, total transfer, request time, and concurrent work. Its preview is intentionally static and network-free: scripts, forms, navigation, external images/fonts and frames are blocked. Downloaded HTML remains third-party active content and must only be opened after review. Per-instance concurrency protection is not a distributed quota; public deployments should also configure gateway rate limits.

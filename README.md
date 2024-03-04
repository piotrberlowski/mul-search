# MUL Search

This app is a simple [Master Unit List](http://www.masterunitlist.info) search wrapper created for the purposes of creating BattleTech Alpha Strike lists.

"MUL Search" is extremely opinionated on the search flow, to serve a purpose of:
* finding units that can be used for a given Faction in a given Availability Era
* displaying and reviewing the units' Alpha Strike stats in a single pane

The author found the above two behaviors to be difficult in the upstream MasterUnitList UI and necessary for the list-building in the [WNRP 350 format](https://wolfsdragoons.com/alpha-strike-core-tournament-rules-2/).

## Developing

This app is a basic [Next.js](https://nextjs.org/) project using the new React App router.

Use your favourite editor to deal with code (VSCode was used to write most of this).

### Getting Started

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

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

### Credit

Auth logic is sourced from [AuthV5-Toolkit](https://github.com/RicardoGEsteves/AuthV5-Toolkit/blob/main/prisma/schema.prisma) by [Ricardo G Esteves](https://github.com/RicardoGEsteves)

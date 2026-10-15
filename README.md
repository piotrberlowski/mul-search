# MUL Search

This app is a simple [Master Unit List](http://www.masterunitlist.info) search wrapper created for the purposes of creating BattleTech Alpha Strike lists.

"MUL Search" is extremely opinionated on the search flow, to serve a purpose of:
* finding units that can be used for a given Faction in a given Availability Era
* displaying and reviewing the units' Alpha Strike stats in a single pane

The author found the above two behaviors to be difficult in the upstream MasterUnitList UI and necessary for the list-building in the [WNRP 350 format](https://wolfsdragoons.com/alpha-strike-core-tournament-rules-2/).

# Credits

 * ITVBBjorn for their [AS Play UI](https://github.com/itvbbjorn/itvbbjorn.github.io)

## Developing

This app is a basic [Next.js](https://nextjs.org/) project using the new React App router.

Use your favourite editor to deal with code (VSCode was used to write most of this).

### Getting Started

First, run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### MUL production backfill

```bash
pnpm mul:backfill:prod
```

That command does the full backfill. It reads the production database from `.env.production.local`, connects directly (`DB_URL_NON_POOLING`), refreshes the MUL data bundle when the manifest has changed, then scrapes every unit page that is missing stats or older than the sitemap. It waits 10 seconds between page requests and prints the database host before it writes.

`pnpm mul:backfill` is the same job against the local database in `.env.local`.

Overrides are optional. Pass them after `--`:

```bash
pnpm mul:backfill:prod -- --scrape-limit 5
pnpm mul:backfill:prod -- --delay-ms 10000
pnpm mul:backfill:prod -- --skip-scrape
```

- `--scrape-limit` caps how many pages this run fetches. The default is every stale page.
- `--delay-ms` sets the pause between pages. The default is 10000.
- `--skip-scrape` (or `--lookups-only`) loads the bundle and skips page scraping.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

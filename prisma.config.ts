import 'dotenv/config'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
    schema: path.join('prisma', 'schema.prisma'),
    migrations: {
        path: path.join('prisma', 'migrations'),
        seed: 'tsx prisma/seed.ts',
    },
    datasource: {
        // Migrations need a direct connection; the app connects through the pooled DB_PRISMA_URL.
        url: process.env.DB_URL_NON_POOLING,
    },
})

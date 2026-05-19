import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import * as fs from 'fs';
import * as path from 'path';

// Use compiled seed.js if it exists (production container), otherwise run typescript seed.ts directly (development)
const seedCommand = fs.existsSync(path.join(__dirname, 'prisma/seed.js'))
  ? 'node prisma/seed.js'
  : 'ts-node prisma/seed.ts';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: seedCommand,
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
